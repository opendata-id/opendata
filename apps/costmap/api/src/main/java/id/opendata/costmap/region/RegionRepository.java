package id.opendata.costmap.region;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import id.opendata.costmap.config.DuckDBConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class RegionRepository {

    @Inject
    DuckDBConfig db;

    public List<Region> findAll() {
        var sql = "SELECT id, code, name, province, type, lat, lng FROM regions ORDER BY province, name";
        var regions = new ArrayList<Region>();

        try (var stmt = db.connection().createStatement();
                var rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                regions.add(Region.from(rs)); // Static factory
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return regions;
    }

    public Optional<Region> findById(int id) {
        var sql = "SELECT id, code, name, province, type, lat, lng FROM regions WHERE id = ?";

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setInt(1, id);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                return Optional.of(Region.from(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return Optional.empty();
    }

    public String findAllAsGeoJson(int year) {
        var sql = """
                WITH region_costs AS (
                    SELECT
                        lc.region_id,
                        json_group_object(
                            cc.slug,
                            json_object('min', lc.min_cost, 'avg', lc.avg_cost, 'max', lc.max_cost)
                        ) as costs
                    FROM living_costs lc
                    JOIN cost_categories cc ON lc.category_id = cc.id
                    WHERE lc.year = ?
                    GROUP BY lc.region_id
                )
                SELECT json_group_array(json_object(
                    'type', 'Feature',
                    'id', r.id,
                    'geometry', json(ST_AsGeoJSON(r.geometry)),
                    'properties', json_object(
                        'id', r.id,
                        'name', r.name,
                        'province', r.province,
                        'type', r.type,
                        'umr', w.umr,
                        'costs', COALESCE(json(rc.costs), json('{}'))
                    )
                )) as features
                FROM regions r
                LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
                LEFT JOIN region_costs rc ON r.id = rc.region_id
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setInt(1, year);
            stmt.setInt(2, year);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                return "{\"type\":\"FeatureCollection\",\"features\":" + rs.getString("features") + "}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{\"type\":\"FeatureCollection\",\"features\":[]}";
    }

    public String findProvincesAsGeoJson(int year) {
        var sql = """
                WITH province_data AS (
                    SELECT
                        r.province,
                        ST_MakeValid(ST_Buffer(ST_Union_Agg(r.geometry), 0)) as geometry,
                        AVG(w.umr) as avg_umr,
                        COUNT(r.id) as region_count
                    FROM regions r
                    LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
                    GROUP BY r.province
                )
                SELECT json_group_array(json_object(
                    'type', 'Feature',
                    'geometry', json(ST_AsGeoJSON(geometry)),
                    'properties', json_object(
                        'name', province,
                        'regionCount', region_count,
                        'avgUmr', avg_umr
                    )
                )) as features
                FROM province_data
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setInt(1, year);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                return "{\"type\":\"FeatureCollection\",\"features\":" + rs.getString("features") + "}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{\"type\":\"FeatureCollection\",\"features\":[]}";
    }
}
