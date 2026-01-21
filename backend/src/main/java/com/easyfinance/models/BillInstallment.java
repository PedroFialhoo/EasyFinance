package com.easyfinance.models;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class BillInstallment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @ManyToOne
    @JoinColumn(name = "bill_id")
    private Bill bill;
    private int installmentNumber; 
    private double value;
    @Column(columnDefinition = "TEXT")
    private LocalDate dueDate;
    @Column(columnDefinition = "TEXT")
    private LocalDate paymentDate;
}
