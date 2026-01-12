package id.opendata.costmap.region;

import java.util.List;

import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/regions")
@Produces(MediaType.APPLICATION_JSON)
public class RegionResource {

  @Inject
  RegionRepository repo;

  @GET
  public List<Region> list() {
    return repo.findAll();
  }

  @GET
  @Path("/geojson")
  public Response geojson(@QueryParam("year") @DefaultValue("2025") int year) {
    return Response.ok(repo.findAllAsGeoJson(year))
        .type("application/geo+json")
        .build();
  }

  @GET
  @Path("/provinces/geojson")
  public Response provincesGeojson(@QueryParam("year") @DefaultValue("2025") int year) {
    return Response.ok(repo.findProvincesAsGeoJson(year))
        .type("application/geo+json")
        .build();
  }

  @GET
  @Path("/{id}")
  public Response get(@PathParam("id") int id) {
    return repo.findById(id)
        .map(Response::ok)
        .orElse(Response.status(404))
        .build();
  }
}
