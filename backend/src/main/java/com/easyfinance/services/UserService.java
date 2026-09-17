package com.easyfinance.services;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.RevenueDto;
import com.easyfinance.dtos.CategoryExpenseDto;
import com.easyfinance.dtos.ChangePasswordDto;
import com.easyfinance.dtos.DashboardDto;
import com.easyfinance.dtos.MonthlySummaryDto;
import com.easyfinance.dtos.UserDto;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BalanceAccountRepository;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BillInstallmentRepository billInstallmentRepository;

    @Autowired
    private BalanceAccountRepository balanceAccountRepository;

    @Autowired
    private BillService billService;


    public Boolean createUser(UserDto userDto){
        if (userDto == null || userDto.getEmail() == null || !userDto.getEmail().contains("@")) {
            throw new IllegalArgumentException("Informe um e-mail válido");
        }
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Informe uma senha");
        }
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Este e-mail já está cadastrado");
        }
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        user.setUsername(userDto.getUsername());

        userRepository.save(user);
        
        return true;
    }

    public Boolean updateUser(UserDto userDto){
        if (userDto == null || userDto.getUsername() == null || userDto.getUsername().isBlank()) {
            throw new IllegalArgumentException("Nome de usuario obrigatorio");
        }
        if (userDto.getEmail() == null || !userDto.getEmail().contains("@")) {
            throw new IllegalArgumentException("E-mail invalido");
        }
        User user = getActiveUser();
        Optional<User> existingUser = userRepository.findByEmail(userDto.getEmail());
        if (existingUser.isPresent() && existingUser.get().getId() != user.getId()) {
            throw new IllegalArgumentException("Este e-mail ja esta cadastrado");
        }

        user.setEmail(userDto.getEmail());
        user.setUsername(userDto.getUsername());
        userRepository.save(user);
        return true;
    }

    public Boolean changePassword(ChangePasswordDto dto) {
        if (dto == null || dto.getCurrentPassword() == null || dto.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Informe a senha atual");
        }
        if (dto.getNewPassword() == null || dto.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("Informe a nova senha");
        }

        User user = getActiveUser();
        if (!user.getPassword().equals(dto.getCurrentPassword())) {
            throw new IllegalArgumentException("A senha atual esta incorreta");
        }
        user.setPassword(dto.getNewPassword());
        userRepository.save(user);
        return true;
    }

    public RevenueDto getRevenue(){
        Integer userId = UserSession.getId();
        if (userId == null) {
            return null;
        }
        Optional<User> optUser = userRepository.findById(userId);
        if(optUser.isEmpty()){
            return null;
        }
        User user = optUser.get();

        RevenueDto dto = new RevenueDto();
        dto.setRevenue(monthlyRevenueFor(user.getId()));
        LocalDate inicio = LocalDate.now().withDayOfMonth(1);
        LocalDate fim = inicio.plusMonths(1).minusDays(1);
        billService.ensureRecurringOccurrencesThrough(user.getId(), fim);

        List<BillInstallment> installments = billInstallmentRepository.findByDueDateBetween(inicio, fim);
        Double totalExpenses = 0.0;
        for (BillInstallment billInstallment : installments) {
            if(billInstallment.getBill().getUser().getId() == UserSession.getId()){
               totalExpenses += billInstallment.getValue(); 
            }            
        }
        dto.setExpenses(totalExpenses);
        return dto;
    }

    public DashboardDto getDashboard() {
        User user = getActiveUser();
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate start = currentMonth.minusMonths(5);
        LocalDate end = currentMonth.plusMonths(1);
        billService.ensureRecurringOccurrencesThrough(user.getId(), end);
        List<BillInstallment> installments = billInstallmentRepository
                .findByUserAndDueDateRange(user.getId(), start, end);

        Map<YearMonth, Double> expensesByMonth = new LinkedHashMap<>();
        for (int index = 0; index < 6; index++) {
            expensesByMonth.put(YearMonth.from(start.plusMonths(index)), 0.0);
        }

        Map<String, Double> expensesByCategory = new LinkedHashMap<>();
        YearMonth activeMonth = YearMonth.from(currentMonth);
        for (BillInstallment installment : installments) {
            YearMonth month = YearMonth.from(installment.getDueDate());
            expensesByMonth.computeIfPresent(month, (key, value) -> value + installment.getValue());

            if (month.equals(activeMonth)) {
                String category = installment.getBill().getCategory() == null
                        ? "Sem categoria"
                        : installment.getBill().getCategory().getName();
                expensesByCategory.merge(category, installment.getValue(), Double::sum);
            }
        }

        DashboardDto dto = new DashboardDto();
        double revenue = monthlyRevenueFor(user.getId());
        for (Map.Entry<YearMonth, Double> entry : expensesByMonth.entrySet()) {
            dto.getMonthlySummary().add(new MonthlySummaryDto(entry.getKey().toString(), revenue, entry.getValue()));
        }

        List<Map.Entry<String, Double>> categories = new ArrayList<>(expensesByCategory.entrySet());
        categories.sort((first, second) -> Double.compare(second.getValue(), first.getValue()));
        for (Map.Entry<String, Double> entry : categories) {
            dto.getExpensesByCategory().add(new CategoryExpenseDto(entry.getKey(), entry.getValue()));
        }
        return dto;
    }

    public UserDto getUser(){
        Integer userId = UserSession.getId();
        if (userId == null) {
            return null;
        }
        Optional<User> optUser = userRepository.findById(userId);
        if(optUser.isEmpty()){
            return null;
        }
        User user = optUser.get();
        UserDto dto = new UserDto();
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        return dto;
    }

    
    public UserDto rememberMe(){
        Optional<User> optUser = userRepository.findByRememberMe(true);
        if(optUser.isEmpty()){
            return null;
        }
        User user = optUser.get();
        UserDto dto = new UserDto();
        dto.setEmail(user.getEmail());
        dto.setPassword(user.getPassword());
        dto.setRememberMe(user.getRememberMe());
        return dto;        
    }

    public void setRememberMe(User user, Boolean rememberMe){
        if(Boolean.TRUE.equals(rememberMe)){
          Optional<User> optUser = userRepository.findByRememberMe(true);
            if(optUser.isPresent()){
                User oldUser = optUser.get();
                oldUser.setRememberMe(false);
                userRepository.save(oldUser);
            }  
        }        
        
        user.setRememberMe(Boolean.TRUE.equals(rememberMe));
        userRepository.save(user);
        
    }

    public void clearRememberMe() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            return;
        }

        userRepository.findById(userId).ifPresent(user -> {
            user.setRememberMe(false);
            userRepository.save(user);
        });
    }

    private User getActiveUser() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            throw new IllegalArgumentException("Nenhuma conta ativa");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Conta ativa nao encontrada"));
    }

    private double monthlyRevenueFor(int userId) {
        return balanceAccountRepository.findByUserId(userId)
                .map(account -> account.getMonthlyRevenue() == null ? 0.0 : account.getMonthlyRevenue())
                .orElse(0.0);
    }
}
