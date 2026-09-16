package com.easyfinance;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SqliteBalanceEntryMigration implements CommandLineRunner {
    private final DataSource dataSource;

    public SqliteBalanceEntryMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            if (!requiresMigration(connection)) {
                return;
            }

            try (Statement statement = connection.createStatement()) {
                statement.execute("PRAGMA foreign_keys = OFF");
                statement.execute("""
                    CREATE TABLE balance_entry_new (
                        id INTEGER NOT NULL PRIMARY KEY,
                        amount FLOAT NOT NULL,
                        balance_after FLOAT NOT NULL,
                        description VARCHAR(255),
                        entry_date VARCHAR(255),
                        reference_key VARCHAR(255) UNIQUE,
                        type VARCHAR(255) CHECK (type IN (
                            'INITIAL_BALANCE',
                            'MONTHLY_REVENUE',
                            'BILL_PAYMENT',
                            'BILL_PAYMENT_REVERSAL',
                            'MANUAL_ADJUSTMENT'
                        )),
                        user_id INTEGER
                    )
                    """);
                statement.execute("""
                    INSERT INTO balance_entry_new (id, amount, balance_after, description, entry_date, reference_key, type, user_id)
                    SELECT id, amount, balance_after, description, entry_date, reference_key, type, user_id
                    FROM balance_entry
                    """);
                statement.execute("DROP TABLE balance_entry");
                statement.execute("ALTER TABLE balance_entry_new RENAME TO balance_entry");
                statement.execute("PRAGMA foreign_keys = ON");
            }
        }
    }

    private boolean requiresMigration(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'balance_entry'");
                ResultSet resultSet = statement.executeQuery()) {
            return resultSet.next()
                    && !resultSet.getString("sql").contains("BILL_PAYMENT_REVERSAL");
        }
    }
}
