package com.easyfinance.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.LoginDto;
import com.easyfinance.models.User;
import com.easyfinance.repositories.UserRepository;

@Service
public class AuthService {
    @Autowired 
    UserRepository userRepository;

    @Autowired
    UserService userService;

    public User login(LoginDto dto){
        Optional<User> optUser = userRepository.findByEmail(dto.getEmail());   
        if(optUser.isPresent()){
            User user = optUser.get();
            if(user.getPassword().equals(dto.getPassword())){            
                userService.setRememberMe(user, dto.getRememberMe());
                
                return user;
            }
        }
        return null;
    }

}
