package com.easyfinance.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private int id;
    private String username;
    private String email;
    private String password;
    private Double revenue;
    private Boolean rememberMe;
    
    // private List<Bill> bills;
    // private List<Card> cards;
}
