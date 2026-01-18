package com.easyfinance.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String number;
    @ManyToOne
    @JoinColumn(name = "holder_id")
    private Holder holder;
    @ManyToOne
    @JoinColumn(name = "bank_id")
    private Bank bank;
    private Boolean active;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
