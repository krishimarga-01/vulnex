package com.extremeweather.service;

import com.extremeweather.dto.AuthRequest;
import com.extremeweather.dto.AuthResponse;
import com.extremeweather.dto.RegisterRequest;
import com.extremeweather.entity.AccountStatus;
import com.extremeweather.entity.RoleEnum;
import com.extremeweather.entity.User;
import com.extremeweather.exception.ConflictException;
import com.extremeweather.repository.UserRepository;
import com.extremeweather.security.JwtTokenProvider;
import com.extremeweather.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.extremeweather.repository.RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Should register new user and issue JWT token")
    void testRegisterUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("new_officer")
                .email("new_officer@gov.org")
                .password("Secret@123")
                .fullName("New Officer")
                .role(RoleEnum.ROLE_AUTHORITY)
                .build();

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .username("new_officer")
                .email("new_officer@gov.org")
                .passwordHash("hashedSecret")
                .fullName("New Officer")
                .role(RoleEnum.ROLE_AUTHORITY)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername("new_officer")).thenReturn(false);
        when(userRepository.existsByEmail("new_officer@gov.org")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashedSecret");
        when(roleRepository.findByRoleName(anyString())).thenReturn(Optional.of(new com.extremeweather.entity.Role(UUID.randomUUID(), "AUTHORITY", "Authority Role")));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("jwt.token.here");
        when(tokenProvider.getJwtExpirationMs()).thenReturn(86400000L);

        AuthResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        assertEquals("new_officer@gov.org", response.getUsername());
        assertEquals(RoleEnum.ROLE_AUTHORITY, response.getRole());
    }

    @Test
    @DisplayName("Should throw ConflictException if username already registered")
    void testDuplicateUsernameThrows() {
        RegisterRequest request = RegisterRequest.builder()
                .username("admin")
                .email("admin@test.org")
                .password("pass")
                .fullName("Admin")
                .build();

        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThrows(ConflictException.class, () -> userService.register(request));
    }
}