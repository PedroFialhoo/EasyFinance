package com.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.RevenueDto;
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
        boolean success = userService.updateUser(userDto);
        if(success){
            return ResponseEntity.ok("User update!");
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not update!");
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue() {
        RevenueDto revenue = userService.getRevenue();
        return ResponseEntity.status(HttpStatus.OK).body(revenue);
    }

    @GetMapping("/get")
    public ResponseEntity<?> getUser() {
        UserDto user = userService.getUser();
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }
    
}
