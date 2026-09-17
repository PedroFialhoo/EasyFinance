package com.easyfinance;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SqliteBalanceRevenueMigration implements CommandLineRunner {
    private final DataSource dataSource;

    public SqliteBalanceRevenueMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            if (!hasLegacyRevenueColumn(connection)) {
                return;
            }
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate("""
                    UPDATE balance_account
                    SET monthly_revenue = COALESCE(monthly_revenue, (
                        SELECT revenue FROM user WHERE user.id = balance_account.user_id
                    )), revenue_payment_day = COALESCE(revenue_payment_day, 1)
                    """);
            }
        }
    }

    private boolean hasLegacyRevenueColumn(Connection connection) throws Exception {
        try (Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("PRAGMA table_info(user)")) {
            while (resultSet.next()) {
                if ("revenue".equals(resultSet.getString("name"))) {
                    return true;
                }
            }
            return false;
        }
    }
}
