package com.easyfinance.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.LoginDto;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.services.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
        if (UserSession.getId() != null) {
            UserSession.setId(null);
        }
        User user = authService.login(dto);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email or password incorrect");
        }
        UserSession.setId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successful login");
        response.put("userId", user.getId());
        System.out.println("User: " + UserSession.getId() + " login");
        return ResponseEntity.ok(response);
    }    

    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        if (UserSession.getId() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("no user logged in");
        }
        System.out.println("User: " + UserSession.getId() + " Logout");
        UserSession.setId(null);
        return ResponseEntity.ok("Successful logout");
    }
    
}
