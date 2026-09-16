package com.easyfinance.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.easyfinance.dtos.BillDto;
import com.easyfinance.dtos.BillInstallmentDto;
import com.easyfinance.dtos.CategoryDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.Category;
import com.easyfinance.models.TypePayment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.BillRepository;
import com.easyfinance.repositories.CardRepository;
import com.easyfinance.repositories.CategoryRepository;
import com.easyfinance.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillInstallmentRepository billInstallmentRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BillInstallmentService billInstallmentService;

    @Mock
    private BalanceService balanceService;

    @Mock
    private BillAttachmentService billAttachmentService;

    @InjectMocks
    private BillService billService;

    @AfterEach
    void clearSession() {
        UserSession.setId(null);
    }

    @Test
    void createRejectsZeroInstallmentsBeforePersisting() {
        BillDto dto = validBillDto();
        dto.setNumberInstallments(0);

        assertThrows(IllegalArgumentException.class, () -> billService.create(dto));

        verify(billRepository, never()).save(any());
    }

    @Test
    void createRejectsNegativeValueBeforePersisting() {
        BillDto dto = validBillDto();
        dto.setTotalValue(-1);

        assertThrows(IllegalArgumentException.class, () -> billService.create(dto));

        verify(billRepository, never()).save(any());
    }

    @Test
    void createGeneratesTheValidatedNumberOfInstallments() {
        UserSession.setId(1);
        User user = user(1);
        Category category = new Category();
        category.setId(1);
        BillDto dto = validBillDto();
        dto.setNumberInstallments(3);

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));

        billService.create(dto);

        verify(billRepository).save(any(Bill.class));
        verify(billInstallmentService, times(3)).create(any(Bill.class), any(Integer.class), any(Double.class), any(LocalDate.class), any());
    }

    @Test
    void createFixedBillGeneratesEveryMonthUntilItsEndDate() {
        UserSession.setId(1);
        User user = user(1);
        Category category = new Category();
        category.setId(1);
        BillDto dto = validBillDto();
        dto.setFixedRecurring(true);
        dto.setFirstDueDate(LocalDate.of(2026, 1, 10));
        dto.setRecurrenceEndDate(LocalDate.of(2026, 12, 1));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));

        billService.create(dto);

        verify(billInstallmentService, times(12)).create(any(Bill.class), any(Integer.class), any(Double.class), any(LocalDate.class), any());
    }

    @Test
    void editRejectsInstallmentCountChanges() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setId(10);
        bill.setUser(user(1));
        bill.setNumberInstallments(2);
        BillDto dto = validBillDto();
        dto.setId(10);
        dto.setNumberInstallments(3);

        when(billRepository.findById(10)).thenReturn(Optional.of(bill));

        assertThrows(IllegalArgumentException.class, () -> billService.edit(dto));

        verify(billRepository, never()).save(any());
    }

    @Test
    void editUpdatesCategoryWithoutRequiringACard() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setId(10);
        bill.setUser(user(1));
        bill.setNumberInstallments(1);
        Category category = new Category();
        category.setId(2);
        BillDto dto = validBillDto();
        dto.setId(10);
        dto.getCategory().setId(2);

        when(billRepository.findById(10)).thenReturn(Optional.of(bill));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(category));
        when(billInstallmentRepository.findByBillId(10)).thenReturn(List.of(installment(bill, 1, LocalDate.of(2026, 1, 10))));

        billService.edit(dto);

        assertSame(category, bill.getCategory());
        verify(billRepository).save(bill);
    }

    @Test
    void editPreservesInstallmentDueDates() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setId(10);
        bill.setUser(user(1));
        bill.setNumberInstallments(2);
        bill.setTotalValue(100);
        Category category = new Category();
        category.setId(1);
        BillInstallment first = installment(bill, 1, LocalDate.of(2026, 1, 10));
        BillInstallment second = installment(bill, 2, LocalDate.of(2026, 2, 10));
        BillDto dto = validBillDto();
        dto.setId(10);
        dto.setNumberInstallments(2);
        dto.setTotalValue(120);
        dto.setFirstDueDate(LocalDate.of(2026, 2, 10));

        when(billRepository.findById(10)).thenReturn(Optional.of(bill));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(billInstallmentRepository.findByBillId(10)).thenReturn(List.of(first, second));

        billService.edit(dto);

        assertEquals(LocalDate.of(2026, 1, 10), first.getDueDate());
        assertEquals(LocalDate.of(2026, 2, 10), second.getDueDate());
        verify(billInstallmentRepository, times(2)).save(any(BillInstallment.class));
    }

    @Test
    void payBillRejectsAnAlreadyPaidInstallment() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setUser(user(1));
        bill.setTypePayment(TypePayment.MONEY);
        BillInstallment installment = new BillInstallment();
        installment.setBill(bill);
        installment.setPaymentDate(LocalDate.of(2026, 1, 1));
        BillInstallmentDto dto = new BillInstallmentDto();
        dto.setId(5);

        when(billInstallmentRepository.findById(5)).thenReturn(Optional.of(installment));

        assertFalse(billService.payBill(dto));

        verify(billInstallmentRepository, never()).save(any());
    }

    @Test
    void deleteDoesNotRemoveAnUnknownBill() {
        when(billRepository.findById(99)).thenReturn(Optional.empty());

        assertFalse(billService.delete(99));

        verify(billInstallmentRepository, never()).deleteAllByBillId(any(Integer.class));
        verify(billRepository, never()).deleteById(any(Integer.class));
    }

    @Test
    void deleteReversesOnlyPaidInstallments() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setId(10);
        bill.setUser(user(1));
        BillInstallment paid = installment(bill, 1, LocalDate.of(2026, 1, 10));
        paid.setPaymentDate(LocalDate.of(2026, 1, 10));
        BillInstallment unpaid = installment(bill, 2, LocalDate.of(2026, 2, 10));

        when(billRepository.findById(10)).thenReturn(Optional.of(bill));
        when(billInstallmentRepository.findByBillId(10)).thenReturn(List.of(paid, unpaid));

        assertTrue(billService.delete(10));

        verify(balanceService).reversePaidInstallment(paid);
        verify(balanceService, never()).reversePaidInstallment(unpaid);
        verify(billAttachmentService).deleteAll(bill);
        verify(billInstallmentRepository).deleteAllByBillId(10);
        verify(billRepository).deleteById(10);
    }

    @Test
    void cancelFixedBillKeepsPaidInstallmentsAndRemovesFuturePendingOnes() {
        UserSession.setId(1);
        Bill bill = new Bill();
        bill.setId(10);
        bill.setUser(user(1));
        bill.setFixedRecurring(true);

        when(billRepository.findById(10)).thenReturn(Optional.of(bill));

        assertTrue(billService.cancelRecurringBill(10));

        assertTrue(bill.isCancelled());
        verify(billRepository).save(bill);
        verify(billInstallmentRepository).deletePendingByBillIdAfter(org.mockito.ArgumentMatchers.eq(10), any(LocalDate.class));
    }

    private BillDto validBillDto() {
        CategoryDto category = new CategoryDto();
        category.setId(1);
        BillDto dto = new BillDto();
        dto.setName("Internet");
        dto.setCategory(category);
        dto.setTypePayment(TypePayment.MONEY);
        dto.setNumberInstallments(1);
        dto.setTotalValue(100);
        dto.setFirstDueDate(LocalDate.of(2026, 1, 10));
        return dto;
    }

    private User user(int id) {
        User user = new User();
        user.setId(id);
        return user;
    }

    private BillInstallment installment(Bill bill, int number, LocalDate dueDate) {
        BillInstallment installment = new BillInstallment();
        installment.setBill(bill);
        installment.setInstallmentNumber(number);
        installment.setDueDate(dueDate);
        return installment;
    }
}
