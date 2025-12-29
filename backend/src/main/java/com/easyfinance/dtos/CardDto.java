package com.easyfinance.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CardDto {
    private Integer id;
    private String number; 
    private HolderDto holder;
    private BankDto bank;
    private Boolean active;
    private UserDto user;
}
