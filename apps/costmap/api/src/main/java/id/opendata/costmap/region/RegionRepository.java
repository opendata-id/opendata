package id.opendata.costmap.region;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import id.opendata.costmap.config.DuckDBConfig;
import io.quarkus.cache.CacheResult;
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

    @CacheResult(cacheName = "regions-geojson")
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

    @CacheResult(cacheName = "provinces-geojson")
    public String findProvincesAsGeoJson(int year) {
        var sql = """
                WITH province_stats AS (
                    SELECT
                        r.province,
                        AVG(w.umr) as avg_umr,
                        COUNT(r.id) as region_count
                    FROM regions r
                    LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
                    GROUP BY r.province
                )
                SELECT json_group_array(json_object(
                    'type', 'Feature',
                    'geometry', json(ST_AsGeoJSON(p.geometry)),
                    'properties', json_object(
                        'name', p.name,
                        'regionCount', COALESCE(ps.region_count, 0),
                        'avgUmr', ps.avg_umr
                    )
                )) as features
                FROM provinces p
                LEFT JOIN province_stats ps ON p.name = ps.province
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

    public String findCostsById(int regionId, int year) {
        var sql = """
                SELECT json_group_object(
                    cc.slug,
                    json_object('min', lc.min_cost, 'avg', lc.avg_cost, 'max', lc.max_cost)
                ) as costs
                FROM living_costs lc
                JOIN cost_categories cc ON lc.category_id = cc.id
                WHERE lc.region_id = ? AND lc.year = ?
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setInt(1, regionId);
            stmt.setInt(2, year);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                var costs = rs.getString("costs");
                return costs != null ? costs : "{}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{}";
    }

    public String findWageById(int regionId, int year) {
        var sql = """
                SELECT json_object(
                    'umr', CAST(w.umr AS INTEGER),
                    'ump', CAST(pw.ump AS INTEGER)
                ) as wage
                FROM regions r
                LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
                LEFT JOIN province_wages pw ON r.province = pw.province AND pw.year = ?
                WHERE r.id = ?
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setInt(1, year);
            stmt.setInt(2, year);
            stmt.setInt(3, regionId);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                var wage = rs.getString("wage");
                return wage != null ? wage : "{}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{}";
    }

    public String findProvinceUmp(String provinceName, int year) {
        var sql = """
                SELECT json_object(
                    'ump', CAST(pw.ump AS INTEGER),
                    'regionCount', (SELECT COUNT(*) FROM regions r WHERE r.province = pw.province)
                ) as data
                FROM province_wages pw
                WHERE pw.province = ? AND pw.year = ?
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {

            stmt.setString(1, provinceName);
            stmt.setInt(2, year);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                var data = rs.getString("data");
                return data != null ? data : "{}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{}";
    }

    @CacheResult(cacheName = "all-wages")
    public String findAllWages(int year) {
        var sql = """
                SELECT json_object(
                    'regions', (
                        SELECT json_group_object(
                            CAST(r.id AS TEXT),
                            json_object(
                                'umr', CAST(w.umr AS INTEGER),
                                'ump', CAST(pw.ump AS INTEGER)
                            )
                        )
                        FROM regions r
                        LEFT JOIN wages w ON r.id = w.region_id AND w.year = ?
                        LEFT JOIN province_wages pw ON r.province = pw.province AND pw.year = ?
                    ),
                    'provinces', (
                        SELECT json_group_object(
                            pw.province,
                            json_object(
                                'ump', CAST(pw.ump AS INTEGER),
                                'regionCount', (SELECT COUNT(*) FROM regions r WHERE r.province = pw.province)
                            )
                        )
                        FROM province_wages pw
                        WHERE pw.year = ?
                    )
                ) as data
                """;

        try (var stmt = db.connection().prepareStatement(sql)) {
            stmt.setInt(1, year);
            stmt.setInt(2, year);
            stmt.setInt(3, year);
            var rs = stmt.executeQuery();

            if (rs.next()) {
                var data = rs.getString("data");
                return data != null ? data : "{}";
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        return "{}";
    }
}
