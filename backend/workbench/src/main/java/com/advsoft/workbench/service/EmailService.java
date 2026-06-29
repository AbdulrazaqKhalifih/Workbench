package com.advsoft.workbench.service;

public interface EmailService {
    void sendResetCode(String toEmail, String code);
}
