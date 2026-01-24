package id.opendata.costmap.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DuckDBConfig {
    @ConfigProperty(name = "costmap.db.path", defaultValue = "data/duckdb/dev.db")
    String dbPath;

    private Connection connection;

    @ConfigProperty(name = "costmap.db.readonly", defaultValue = "true")
    boolean readOnly;

    @PostConstruct
    void init() throws Exception {
        Class.forName("org.duckdb.DuckDBDriver");
        Properties props = new Properties();
        props.setProperty("duckdb.read_only", "true");
        connection = DriverManager.getConnection("jdbc:duckdb:" + dbPath, props);
        try {
            connection.createStatement().execute("LOAD spatial");
        } catch (Exception e) {
            System.err.println("Warning: Could not load spatial extension: " + e.getMessage());
        }
    }

    public Connection connection() {
        return connection;
    }

    @PreDestroy
    void close() throws SQLException {
        if (connection != null) connection.close();
    }
}
