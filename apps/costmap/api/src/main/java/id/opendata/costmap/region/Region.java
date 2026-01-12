package id.opendata.costmap.region;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Objects;

public record Region(
        int id,
        String code,
        String name,
        String province,
        String type,
        double lat,
        double lng) {

    public Region {
        Objects.requireNonNull(code, "code required");
        Objects.requireNonNull(name, "name required");
    }

    public static Region from(ResultSet rs) throws SQLException {
        return new Region(
                rs.getInt("id"),
                rs.getString("code"),
                rs.getString("name"),
                rs.getString("province"),
                rs.getString("type"),
                rs.getDouble("lat"),
                rs.getDouble("lng"));
    }
}
