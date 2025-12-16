package com.easyfinance.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.UserDto;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Boolean createUser(UserDto userDto){
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        user.setUsername(userDto.getUsername());

        userRepository.save(user);
        
        return true;
    }

    public Boolean updateUser(UserDto userDto){
        Integer userId = UserSession.getId();
        if(userId == null){
            System.out.println("User not logged in");
            return false;
        }
        Optional<User> optUser = userRepository.findById(userId);
        
        User user = optUser.get();
        if(userDto.getEmail() != null){
           user.setEmail(userDto.getEmail()); 
        }
        if(userDto.getUsername() != null){
           user.setUsername(userDto.getUsername()); 
        }
        if(userDto.getRevenue() != null){
            user.setRevenue(userDto.getRevenue());
        }        

        userRepository.save(user);
        
        return true;
    }

}
