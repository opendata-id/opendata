
package id.opendata.costmap.wage;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;

public record Wage(
        int id,
        int regionId,
        int year,
        BigDecimal umr) {

    public static Wage from(ResultSet rs) throws SQLException {
        return new Wage(
                rs.getInt("id"),
                rs.getInt("region_id"),
                rs.getInt("year"),
                rs.getBigDecimal("umr"));
    }
}
