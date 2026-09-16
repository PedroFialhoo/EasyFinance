package com.easyfinance.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.YearMonth;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.easyfinance.dtos.BalanceAdjustmentDto;
import com.easyfinance.dtos.BalanceDto;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.models.BalanceAccount;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.repositories.BalanceAccountRepository;
import com.easyfinance.repositories.BalanceEntryRepository;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class BalanceServiceTest {
    @Mock
    private BalanceAccountRepository balanceAccountRepository;

    @Mock
    private BalanceEntryRepository balanceEntryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BillInstallmentRepository billInstallmentRepository;

    @InjectMocks
    private BalanceService balanceService;

    @AfterEach
    void clearSession() {
        UserSession.setId(null);
    }

    @Test
    void initializeCreatesTheStartingBalanceEntry() {
        UserSession.setId(1);
        User user = new User();
        user.setId(1);
        BalanceAdjustmentDto adjustment = new BalanceAdjustmentDto();
        adjustment.setBalance(250.75);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(balanceAccountRepository.findByUserId(1)).thenReturn(Optional.empty());
        when(balanceEntryRepository.findByUserIdOrderByEntryDateDescIdDesc(1)).thenReturn(List.of());

        BalanceDto result = balanceService.initialize(adjustment);

        assertTrue(result.isInitialized());
        assertEquals(250.75, result.getBalance());
        verify(balanceAccountRepository).save(any());
        verify(balanceEntryRepository).save(any());
    }

    @Test
    void getBalanceReconcilesPaidInstallmentsWithoutHistory() {
        UserSession.setId(1);
        User user = new User();
        user.setId(1);
        BalanceAccount account = new BalanceAccount();
        account.setUser(user);
        account.setBalance(100);
        account.setLastRevenueMonth(YearMonth.now().toString());
        Bill bill = new Bill();
        bill.setName("Internet");
        bill.setUser(user);
        BillInstallment installment = new BillInstallment();
        installment.setId(10);
        installment.setBill(bill);
        installment.setValue(30);
        installment.setPaymentDate(LocalDate.now());

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(balanceAccountRepository.findByUserId(1)).thenReturn(Optional.of(account));
        when(billInstallmentRepository.findPaidByUser(1)).thenReturn(List.of(installment));
        when(balanceEntryRepository.findByUserIdOrderByEntryDateDescIdDesc(1)).thenReturn(List.of());

        BalanceDto result = balanceService.getBalance();

        assertEquals(70, result.getBalance());
        verify(balanceEntryRepository).save(any());
    }

    @Test
    void recordsRecreatedInstallmentsWithTheSameIdIndependently() {
        User user = new User();
        user.setId(1);
        BalanceAccount account = new BalanceAccount();
        account.setUser(user);
        account.setBalance(100);
        account.setLastRevenueMonth(YearMonth.now().toString());
        Bill bill = new Bill();
        bill.setName("Teste");
        bill.setUser(user);
        BillInstallment original = new BillInstallment();
        original.setId(60);
        original.setBill(bill);
        original.setValue(10);
        original.setPaymentDate(LocalDate.now());
        original.setBalanceReference("original-payment");
        BillInstallment recreated = new BillInstallment();
        recreated.setId(60);
        recreated.setBill(bill);
        recreated.setValue(10);
        recreated.setPaymentDate(LocalDate.now());
        recreated.setBalanceReference("recreated-payment");

        when(balanceAccountRepository.findByUserId(1)).thenReturn(Optional.of(account));

        balanceService.recordPaidInstallment(original);
        balanceService.recordPaidInstallment(recreated);

        assertEquals(80, account.getBalance());
        verify(balanceEntryRepository, times(2)).save(any());
    }
}
