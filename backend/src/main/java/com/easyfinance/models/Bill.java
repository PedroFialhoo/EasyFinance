package com.easyfinance.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    @Enumerated(EnumType.STRING)
    private TypePayment typePayment;
    @ManyToOne
    @JoinColumn(name = "card_id")
    private Card card;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private int numberInstallments;
    private double totalValue;    
    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean fixedRecurring;
    @Column(columnDefinition = "TEXT")
    private LocalDate recurrenceStartDate;
    @Column(columnDefinition = "TEXT")
    private LocalDate recurrenceEndDate;
    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean cancelled;
    @OneToMany(mappedBy = "bill")
    private List<BillInstallment> billInstallments;
}
