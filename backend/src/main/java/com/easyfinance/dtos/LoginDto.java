package com.easyfinance.dtos;

import lombok.Data;

@Data
public class LoginDto {
    private String email;
    private String password;
    private Boolean rememberMe;
}
