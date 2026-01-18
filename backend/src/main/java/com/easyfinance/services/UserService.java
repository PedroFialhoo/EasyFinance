package com.easyfinance.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.RevenueDto;
import com.easyfinance.dtos.UserDto;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BillInstallmentRepository billInstallmentRepository;


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

    public RevenueDto getRevenue(){
        Optional<User> optUser = userRepository.findById(UserSession.getId());
        if(optUser.isEmpty()){
            return null;
        }
        User user = optUser.get();

        RevenueDto dto = new RevenueDto();
        dto.setRevenue(user.getRevenue());
        LocalDate inicio = LocalDate.now().withDayOfMonth(1);
        LocalDate fim = inicio.plusMonths(1);

        List<BillInstallment> installments = billInstallmentRepository.findByDueDateBetween(inicio, fim);
        Double totalExpenses = 0.0;
        for (BillInstallment billInstallment : installments) {
            totalExpenses += billInstallment.getValue();
        }
        dto.setExpenses(totalExpenses);
        return dto;
    }

}
