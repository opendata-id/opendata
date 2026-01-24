package id.opendata.costmap.cost;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;

public record LivingCost(
        int id,
        int regionId,
        String category,
        int year,
        BigDecimal minCost,
        BigDecimal avgCost,
        BigDecimal maxCost) {

    public static LivingCost from(ResultSet rs) throws SQLException {
        return new LivingCost(
                rs.getInt("id"),
                rs.getInt("region_id"),
                rs.getString("category"),
                rs.getInt("year"),
                rs.getBigDecimal("min_cost"),
                rs.getBigDecimal("avg_cost"),
                rs.getBigDecimal("max_cost"));
    }
}
