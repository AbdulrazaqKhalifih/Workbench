package com.advsoft.workbench.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${identity.app.mail.from}")
    private String from;

    @Value("${identity.app.mail.reset.subject}")
    private String resetSubject;

    @Override
    public void sendResetCode(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject(resetSubject);
            helper.setText(buildResetHtml(code), true);

            mailSender.send(message);
        } catch (Exception e) {
            // setup retry/requeue later
            throw new IllegalStateException("Failed to send reset email", e);
        }
    }

    private String buildResetHtml(String code) {
        return """
            <div style="font-family: Arial, sans-serif; line-height: 1.5">
              <h2>Reset your Workbench password</h2>
              <p>Use this code to reset your password:</p>
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0">
                %s
              </div>
              <p>This code expires soon. If you didn't request this, you can ignore this email.</p>
            </div>
            """.formatted(code);
    }

    public void sendPasswordChangedNotification(String email) {
        String subject = "Your Password Has Been Changed";
        String body = """
        Hello,
        
        Your password was recently changed. If you made this change, you can safely ignore this email.
        
        If you did not change your password, please contact our support team immediately.
        
        For your security, all active sessions have been logged out.
        
        Best regards,
        Workbench Team
        """;

        sendEmail(email, subject, body);
    }

    public void sendEmail(String to, String subject, String body){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
        } catch (Exception e) {
            // retry/queue later
            throw new IllegalStateException("Failed to send reset email", e);
        }
    }

}
