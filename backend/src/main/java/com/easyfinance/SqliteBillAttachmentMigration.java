package com.easyfinance;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SqliteBillAttachmentMigration implements CommandLineRunner {
    private final DataSource dataSource;

    public SqliteBillAttachmentMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            if (!hasBillAttachmentTable(connection)) {
                return;
            }
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate("""
                    UPDATE bill_attachment
                    SET created_at = strftime('%Y-%m-%dT%H:%M:%f', CAST(created_at AS REAL) / 1000, 'unixepoch')
                    WHERE trim(created_at) <> ''
                    AND trim(created_at) NOT GLOB '*[^0-9]*'
                    """);
            }
        }
    }

    private boolean hasBillAttachmentTable(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'bill_attachment'")) {
            return resultSet.next();
        }
    }
}
