package com.advsoft.workbench.util;

public class PasswordUtils {

    public static void validatePassword(String pwd) {
        if (pwd == null || pwd.length() < 8)
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        if (!pwd.matches(".*[A-Za-z].*"))
            throw new IllegalArgumentException("Password must contain at least one letter");
        if (!pwd.matches(".*\\d.*"))
            throw new IllegalArgumentException("Password must contain at least one number");
        if (pwd.contains(" "))
            throw new IllegalArgumentException("Password must not contain spaces");
    }
    public static void validatePassword(String pwd, String confirmPwd) {
        if(!pwd.equals(confirmPwd))
            throw new IllegalArgumentException("Confirm Password does not match Password");
        validatePassword(pwd);
    }
}
