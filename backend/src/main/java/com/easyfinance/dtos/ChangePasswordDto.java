package com.easyfinance.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChangePasswordDto {
    private String currentPassword;
    private String newPassword;
}
