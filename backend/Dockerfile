# Stage 1: Build Java 21 LTS Spring Boot Application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy Maven POM and pre-fetch dependencies for fast layered caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Distroless / Temurin Runtime Container
FROM eclipse-temurin:21-jre-alpine AS runtime

LABEL maintainer="VULNEX Disaster Response Team <contact@vulnex.internal>"
LABEL description="VULNEX Extreme Weather Vulnerability Identification & Emergency Response System"

WORKDIR /app

# Security: Run as unprivileged non-root service account
RUN addgroup -S vulnex && adduser -S vulnex -G vulnex
USER vulnex:vulnex

# Copy built artifact from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot standard port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
