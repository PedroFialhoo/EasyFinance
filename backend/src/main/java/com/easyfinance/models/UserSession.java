package com.easyfinance.models;

public class UserSession {
    private static Integer id;

    public static void setId(Integer id) {
        UserSession.id = id;
    }

    public static Integer getId() {
        return id;
    }
}
