package com.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.RevenueDto;
import com.easyfinance.dtos.DashboardDto;
import com.easyfinance.dtos.ChangePasswordDto;
import com.easyfinance.dtos.UserDto;
import com.easyfinance.services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        boolean success = userService.createUser(userDto);
        if(success){
            return ResponseEntity.ok("User create!");
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not create!");
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserDto userDto) {
        try {
            userService.updateUser(userDto);
            return ResponseEntity.ok("User update!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody ChangePasswordDto dto) {
        try {
            userService.changePassword(dto);
            return ResponseEntity.ok("Password updated!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue() {
        RevenueDto revenue = userService.getRevenue();
        return ResponseEntity.status(HttpStatus.OK).body(revenue);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        DashboardDto dashboard = userService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUser() {
        UserDto user = userService.getUser();
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @GetMapping("/rememberMe")
    public ResponseEntity<?> rememberMe() {
        UserDto user = userService.rememberMe();
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }
    
    
}
