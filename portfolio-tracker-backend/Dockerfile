
# Use OpenJDK as the base image
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Copy the Maven pom.xml file and the source code
COPY pom.xml /app/
COPY src /app/src/

# Run the Maven build to create the JAR file
RUN mvn clean install

# Copy the JAR file from the target directory (created by Maven build) to the app directory
COPY target/portfolio-tracker-backend-0.0.1-SNAPSHOT.jar /app/app.jar

# Expose the port the app will run on
EXPOSE 8080

# Run the JAR file
CMD ["java", "-jar", "/app/app.jar"]

