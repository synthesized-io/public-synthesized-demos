# Multi-stage Docker build for Spring Boot application
# Build stage: a plain JDK image. The Gradle wrapper (gradlew) downloads the
# Gradle version that gradle/wrapper/gradle-wrapper.properties gives. A gradle:
# image would add a second Gradle distribution that the build does not use.
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .

# Copy source code
COPY src/ src/

# Build the application (skip tests for faster builds in Docker)
RUN ./gradlew build -x test

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
