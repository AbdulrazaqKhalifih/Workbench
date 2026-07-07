package com.advsoft.workbench.exception;

import com.advsoft.workbench.dto.response.ApiErrorDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorDTO> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorDTO.builder()
                        .code("INVALID_CREDENTIALS")
                        .error(ex.getMessage())
                        .timestamp(Instant.now())
                        .status(HttpStatus.UNAUTHORIZED.toString())
                        .build());
    }

    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<ApiErrorDTO> handleAccountDisabled() {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiErrorDTO.builder()
                        .code("ACCOUNT_DISABLED")
                        .status(HttpStatus.FORBIDDEN.toString())
                        .timestamp(Instant.now())
                        .error("Account is not active")
                        .build());
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleUserNotFound(UsernameNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiErrorDTO.builder()
                        .timestamp(Instant.now())
                        .code("RESOURCE_NOT_FOUND")
                        .status(HttpStatus.NOT_FOUND.toString())
                        .error(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorDTO> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorDTO.builder()
                        .code("BAD_CREDENTIALS")
                        .error("User not found")
                        .timestamp(Instant.now())
                        .status(HttpStatus.BAD_REQUEST.toString())
                        .build()
                );
    }

    @ExceptionHandler(InvalidCodeException.class)
    public ResponseEntity<ApiErrorDTO> handleInvalidCode(InvalidCodeException ex){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorDTO.builder()
                        .code("BAD_REQUEST")
                        .error("Invalid Code")
                        .timestamp(Instant.now())
                        .status(HttpStatus.BAD_REQUEST.toString())
                        .build()
                );
    }

    @ExceptionHandler(EmailAlreadyInUseException.class)
    public ResponseEntity<ApiErrorDTO> handleEmailAlreadyInUse(EmailAlreadyInUseException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiErrorDTO.builder()
                        .code("EMAIL_ALREADY_IN_USE")
                        .error(ex.getMessage())
                        .timestamp(Instant.now())
                        .status(HttpStatus.CONFLICT.toString())
                        .build());
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimitExceeded(RateLimitExceededException ex) {

        HttpHeaders headers = new HttpHeaders();

        // Add Retry-After header (in seconds)
        if (!ex.getRetryAfter().isZero()) {
            headers.add("Retry-After", String.valueOf(ex.getRetryAfter().getSeconds()));
        }

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(headers)
                .body(Map.of(
                        "error", "rate_limit_exceeded",
                        "message", ex.getMessage(),
                        "retry_after_seconds", ex.getRetryAfter().getSeconds(),
                        "timestamp", Instant.now()
                ));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleNoHandler(NoHandlerFoundException ex){
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiErrorDTO.builder()
                        .error(ex.getMessage())
                        .timestamp(Instant.now())
                        .status(HttpStatus.UNPROCESSABLE_ENTITY.toString())
                        .build()
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleValidationError(MethodArgumentNotValidException ex){
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorDTO.builder()
                        .error(ex.getMessage())
                        .timestamp(Instant.now())
                        .status(HttpStatus.UNPROCESSABLE_ENTITY.toString())
                        .build()
                );
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> handleUnexpected(Exception ex) {
        // log ex internally

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorDTO.builder()
                        .code("INTERNAL_ERROR")
                        .timestamp(Instant.now())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.toString())
                        .error(ex.getMessage())
                        .build());
    }
}

