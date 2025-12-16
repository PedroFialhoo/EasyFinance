package com.easyfinance.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.models.User;
import com.easyfinance.repositories.UserRepository;

@Service
public class AuthService {
    @Autowired UserRepository userRepository;

    public User login(String email, String password){
        Optional<User> optUser = userRepository.findByEmail(email);        
        if(optUser.isPresent()){
            User user = optUser.get();
            if(user.getPassword().equals(password)){
                return user;
            }
        }
        return null;
    }
}
