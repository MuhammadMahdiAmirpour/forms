# Stage 1: Build the Go binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy service-specific code
COPY ../.. .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./backend/user-service/

# Stage 2: Create minimal production image
FROM alpine:3.18

WORKDIR /app

# Copy binary and certificates
COPY --from=builder /app/app ./app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expose port
EXPOSE 8081 

CMD ["./app"]
