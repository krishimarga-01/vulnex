package com.extremeweather.service;

import com.extremeweather.dto.*;
import com.extremeweather.entity.AccountStatus;
import com.extremeweather.entity.Role;
import com.extremeweather.entity.RoleEnum;
import com.extremeweather.entity.User;
import com.extremeweather.exception.BadRequestException;
import com.extremeweather.exception.ConflictException;
import com.extremeweather.exception.ResourceNotFoundException;
import com.extremeweather.repository.RoleRepository;
import com.extremeweather.repository.UserRepository;
import com.extremeweather.security.JwtTokenProvider;
import com.extremeweather.security.SecurityUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username or email is already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already in use: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .accountStatus(AccountStatus.ACTIVE)
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .fcmToken(request.getFcmToken())
                .build();

        String targetRole = request.getRole() != null ? request.getRole().name() : "CITIZEN";
        if (targetRole.startsWith("ROLE_")) {
            targetRole = targetRole.substring(5);
        }
        final String finalRole = targetRole;
        Role role = roleRepository.findByRoleName(finalRole)
                .or(() -> roleRepository.findByRoleName("ROLE_" + finalRole))
                .or(() -> roleRepository.findByRoleName("CITIZEN"))
                .or(() -> roleRepository.findByRoleName("ROLE_CITIZEN"))
                .orElse(null);
        if (role != null) {
            user.getRoles().add(role);
        }

        user = userRepository.save(user);
        auditService.logAction("USER_REGISTER", "User", user.getId().toString(), "Registered new user: " + user.getEmail(), null);

        // Authenticate on successful registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getJwtExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String loginIdentifier = request.getUsername();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginIdentifier, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginIdentifier)
                .or(() -> userRepository.findByEmail(loginIdentifier))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginIdentifier));

        auditService.logAction("USER_LOGIN", "User", user.getId().toString(), "User logged in successfully", null);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getJwtExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("No authenticated user in current context");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return mapToProfile(user);
    }

    @Transactional
    public void updateFcmToken(String fcmToken) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId != null) {
            userRepository.findById(userId).ifPresent(user -> {
                user.setFcmToken(fcmToken);
                userRepository.save(user);
            });
        }
    }

    private UserProfileResponse mapToProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .fcmToken(user.getFcmToken())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider, AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }
}
