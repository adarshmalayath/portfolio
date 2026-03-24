package com.portfolio.content.repository;

import com.portfolio.content.dto.PortfolioContent;
import com.portfolio.content.dto.PortfolioContent.CustomSection;
import com.portfolio.content.dto.PortfolioContent.Education;
import com.portfolio.content.dto.PortfolioContent.Project;
import com.portfolio.content.dto.PortfolioContent.SkillGroup;
import com.portfolio.content.dto.PortfolioContent.Stat;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class PortfolioContentRepository {

  private final JdbcTemplate jdbcTemplate;

  public PortfolioContentRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public PortfolioContent load() {
    PortfolioContent content = new PortfolioContent();

    content.setProfile(loadProfile());
    content.setStats(loadStats());
    content.setExperience(loadExperience());
    content.setSkills(loadSkills());
    content.setProjects(loadProjects());
    content.setEducation(loadEducation());
    content.setCertifications(loadCertifications());
    content.setProfileDetails(loadProfileDetails());
    content.setSectionTitles(loadSectionTitles());
    content.setCustomSections(loadCustomSections());

    return content;
  }

  @Transactional
  public PortfolioContent save(PortfolioContent content) {
    saveProfile(content.getProfile());
    saveStats(content.getStats());
    saveExperience(content.getExperience());
    saveSkills(content.getSkills());
    saveProjects(content.getProjects());
    saveEducation(content.getEducation());
    saveCertifications(content.getCertifications());
    saveProfileDetails(content.getProfileDetails());
    saveSectionTitles(content.getSectionTitles());
    saveCustomSections(content.getCustomSections());

    return load();
  }

  private PortfolioContent.Profile loadProfile() {
    try {
      return jdbcTemplate.queryForObject(
          """
          select name, role, headline, summary, location, email, phone, linkedin, github, cv_url
          from profile
          where id = 1
          """,
          (rs, rowNum) -> {
            PortfolioContent.Profile profile = new PortfolioContent.Profile();
            profile.setName(safe(rs.getString("name")));
            profile.setRole(safe(rs.getString("role")));
            profile.setHeadline(safe(rs.getString("headline")));
            profile.setSummary(safe(rs.getString("summary")));
            profile.setLocation(safe(rs.getString("location")));
            profile.setEmail(safe(rs.getString("email")));
            profile.setPhone(safe(rs.getString("phone")));
            profile.setLinkedin(safe(rs.getString("linkedin")));
            profile.setGithub(safe(rs.getString("github")));
            profile.setCvUrl(safe(rs.getString("cv_url")));
            return profile;
          });
    } catch (EmptyResultDataAccessException ex) {
      return new PortfolioContent.Profile();
    }
  }

  private List<Stat> loadStats() {
    return jdbcTemplate.query(
        "select label, value from stats order by sort_order, id",
        (rs, rowNum) -> {
          Stat stat = new Stat();
          stat.setLabel(safe(rs.getString("label")));
          stat.setValue(safe(rs.getString("value")));
          return stat;
        });
  }

  private PortfolioContent.Experience loadExperience() {
    PortfolioContent.Experience experience = new PortfolioContent.Experience();

    try {
      jdbcTemplate.queryForObject(
          "select role, meta from experience where id = 1",
          (rs, rowNum) -> {
            experience.setRole(safe(rs.getString("role")));
            experience.setMeta(safe(rs.getString("meta")));
            return 0;
          });
    } catch (EmptyResultDataAccessException ignored) {
      // Keep empty values when row does not exist.
    }

    List<String> bullets = loadValues("select value from experience_bullet order by sort_order, id");
    experience.setBullets(bullets);
    return experience;
  }

  private List<SkillGroup> loadSkills() {
    List<Map<String, Object>> groups =
        jdbcTemplate.queryForList("select id, title from skill_group order by sort_order, id");

    List<SkillGroup> result = new ArrayList<>();
    for (Map<String, Object> groupRow : groups) {
      long groupId = ((Number) groupRow.get("id")).longValue();
      SkillGroup group = new SkillGroup();
      group.setTitle(safe((String) groupRow.get("title")));
      group.setItems(
          jdbcTemplate.query(
              "select value from skill_item where group_id = ? order by sort_order, id",
              (rs, rowNum) -> safe(rs.getString("value")),
              groupId));
      result.add(group);
    }

    return result;
  }

  private List<Project> loadProjects() {
    return jdbcTemplate.query(
        "select title, tech, description, url from project order by sort_order, id",
        (rs, rowNum) -> {
          Project project = new Project();
          project.setTitle(safe(rs.getString("title")));
          project.setTech(safe(rs.getString("tech")));
          project.setDescription(safe(rs.getString("description")));
          project.setUrl(safe(rs.getString("url")));
          return project;
        });
  }

  private List<Education> loadEducation() {
    return jdbcTemplate.query(
        "select title, meta, detail from education order by sort_order, id",
        (rs, rowNum) -> {
          Education education = new Education();
          education.setTitle(safe(rs.getString("title")));
          education.setMeta(safe(rs.getString("meta")));
          education.setDetail(safe(rs.getString("detail")));
          return education;
        });
  }

  private Map<String, String> loadSectionTitles() {
    Map<String, String> map = new LinkedHashMap<>();

    List<Map<String, Object>> rows =
        jdbcTemplate.queryForList("select section_key, section_value from section_title order by section_key");
    for (Map<String, Object> row : rows) {
      map.put(safe((String) row.get("section_key")), safe((String) row.get("section_value")));
    }

    return map;
  }

  private List<CustomSection> loadCustomSections() {
    List<Map<String, Object>> sections =
        jdbcTemplate.queryForList("select id, title from custom_section order by sort_order, id");

    List<CustomSection> result = new ArrayList<>();
    for (Map<String, Object> sectionRow : sections) {
      long sectionId = ((Number) sectionRow.get("id")).longValue();
      CustomSection section = new CustomSection();
      section.setTitle(safe((String) sectionRow.get("title")));
      section.setLines(
          jdbcTemplate.query(
              "select value from custom_section_line where custom_section_id = ? order by sort_order, id",
              (rs, rowNum) -> safe(rs.getString("value")),
              sectionId));
      result.add(section);
    }

    return result;
  }

  private List<String> loadValues(String sql) {
    return jdbcTemplate.query(sql, (rs, rowNum) -> safe(rs.getString(1)));
  }

  private List<String> loadCertifications() {
    return loadValues("select value from certification order by sort_order, id");
  }

  private List<String> loadProfileDetails() {
    return loadValues("select value from profile_detail order by sort_order, id");
  }

  private void saveProfile(PortfolioContent.Profile profile) {
    PortfolioContent.Profile safeProfile = profile == null ? new PortfolioContent.Profile() : profile;

    jdbcTemplate.update(
        """
        insert into profile (id, name, role, headline, summary, location, email, phone, linkedin, github, cv_url, updated_at)
        values (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())
        on conflict (id)
        do update set
          name = excluded.name,
          role = excluded.role,
          headline = excluded.headline,
          summary = excluded.summary,
          location = excluded.location,
          email = excluded.email,
          phone = excluded.phone,
          linkedin = excluded.linkedin,
          github = excluded.github,
          cv_url = excluded.cv_url,
          updated_at = now()
        """,
        safe(safeProfile.getName()),
        safe(safeProfile.getRole()),
        safe(safeProfile.getHeadline()),
        safe(safeProfile.getSummary()),
        safe(safeProfile.getLocation()),
        safe(safeProfile.getEmail()),
        safe(safeProfile.getPhone()),
        safe(safeProfile.getLinkedin()),
        safe(safeProfile.getGithub()),
        safe(safeProfile.getCvUrl()));
  }

  private void saveStats(List<Stat> stats) {
    jdbcTemplate.update("delete from stats");
    List<Stat> safeStats = Objects.requireNonNullElseGet(stats, ArrayList::new);

    for (int index = 0; index < safeStats.size(); index++) {
      Stat stat = safeStats.get(index);
      jdbcTemplate.update(
          "insert into stats (sort_order, label, value) values (?, ?, ?)",
          index,
          safe(stat == null ? "" : stat.getLabel()),
          safe(stat == null ? "" : stat.getValue()));
    }
  }

  private void saveExperience(PortfolioContent.Experience experience) {
    PortfolioContent.Experience safeExperience =
        experience == null ? new PortfolioContent.Experience() : experience;

    jdbcTemplate.update(
        """
        insert into experience (id, role, meta, updated_at)
        values (1, ?, ?, now())
        on conflict (id)
        do update set
          role = excluded.role,
          meta = excluded.meta,
          updated_at = now()
        """,
        safe(safeExperience.getRole()),
        safe(safeExperience.getMeta()));

    jdbcTemplate.update("delete from experience_bullet");
    List<String> bullets = Objects.requireNonNullElseGet(safeExperience.getBullets(), ArrayList::new);
    for (int index = 0; index < bullets.size(); index++) {
      jdbcTemplate.update(
          "insert into experience_bullet (sort_order, value) values (?, ?)", index, safe(bullets.get(index)));
    }
  }

  private void saveSkills(List<SkillGroup> skills) {
    jdbcTemplate.update("delete from skill_item");
    jdbcTemplate.update("delete from skill_group");

    List<SkillGroup> safeGroups = Objects.requireNonNullElseGet(skills, ArrayList::new);

    for (int groupIndex = 0; groupIndex < safeGroups.size(); groupIndex++) {
      SkillGroup group = safeGroups.get(groupIndex);
      final int order = groupIndex;
      final String title = safe(group == null ? "" : group.getTitle());

      KeyHolder keyHolder = new GeneratedKeyHolder();
      jdbcTemplate.update(
          connection -> {
            PreparedStatement statement =
                connection.prepareStatement(
                    "insert into skill_group (sort_order, title) values (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, order);
            statement.setString(2, title);
            return statement;
          },
          keyHolder);

      Number generatedKey = keyHolder.getKey();
      if (generatedKey == null) {
        continue;
      }
      long groupId = generatedKey.longValue();

      List<String> items =
          Objects.requireNonNullElseGet(group == null ? null : group.getItems(), ArrayList::new);
      for (int itemIndex = 0; itemIndex < items.size(); itemIndex++) {
        jdbcTemplate.update(
            "insert into skill_item (group_id, sort_order, value) values (?, ?, ?)",
            groupId,
            itemIndex,
            safe(items.get(itemIndex)));
      }
    }
  }

  private void saveProjects(List<Project> projects) {
    jdbcTemplate.update("delete from project");

    List<Project> safeProjects = Objects.requireNonNullElseGet(projects, ArrayList::new);
    for (int index = 0; index < safeProjects.size(); index++) {
      Project project = safeProjects.get(index);
      jdbcTemplate.update(
          "insert into project (sort_order, title, tech, description, url) values (?, ?, ?, ?, ?)",
          index,
          safe(project == null ? "" : project.getTitle()),
          safe(project == null ? "" : project.getTech()),
          safe(project == null ? "" : project.getDescription()),
          safe(project == null ? "" : project.getUrl()));
    }
  }

  private void saveEducation(List<Education> educationList) {
    jdbcTemplate.update("delete from education");

    List<Education> safeEducation = Objects.requireNonNullElseGet(educationList, ArrayList::new);
    for (int index = 0; index < safeEducation.size(); index++) {
      Education education = safeEducation.get(index);
      jdbcTemplate.update(
          "insert into education (sort_order, title, meta, detail) values (?, ?, ?, ?)",
          index,
          safe(education == null ? "" : education.getTitle()),
          safe(education == null ? "" : education.getMeta()),
          safe(education == null ? "" : education.getDetail()));
    }
  }

  private void saveCertifications(List<String> values) {
    jdbcTemplate.update("delete from certification");
    List<String> safeValues = Objects.requireNonNullElseGet(values, ArrayList::new);
    for (int index = 0; index < safeValues.size(); index++) {
      jdbcTemplate.update(
          "insert into certification (sort_order, value) values (?, ?)", index, safe(safeValues.get(index)));
    }
  }

  private void saveProfileDetails(List<String> values) {
    jdbcTemplate.update("delete from profile_detail");

    List<String> safeValues = Objects.requireNonNullElseGet(values, ArrayList::new);
    for (int index = 0; index < safeValues.size(); index++) {
      jdbcTemplate.update(
          "insert into profile_detail (sort_order, value) values (?, ?)", index, safe(safeValues.get(index)));
    }
  }

  private void saveSectionTitles(Map<String, String> sectionTitles) {
    jdbcTemplate.update("delete from section_title");

    Map<String, String> safeMap =
        sectionTitles == null ? new LinkedHashMap<>() : new LinkedHashMap<>(sectionTitles);

    safeMap.forEach(
        (key, value) ->
            jdbcTemplate.update(
                "insert into section_title (section_key, section_value) values (?, ?)",
                safe(key),
                safe(value)));
  }

  private void saveCustomSections(List<CustomSection> customSections) {
    jdbcTemplate.update("delete from custom_section_line");
    jdbcTemplate.update("delete from custom_section");

    List<CustomSection> safeSections = Objects.requireNonNullElseGet(customSections, ArrayList::new);

    for (int sectionIndex = 0; sectionIndex < safeSections.size(); sectionIndex++) {
      CustomSection section = safeSections.get(sectionIndex);
      final int order = sectionIndex;
      final String title = safe(section == null ? "" : section.getTitle());

      KeyHolder keyHolder = new GeneratedKeyHolder();
      jdbcTemplate.update(
          connection -> {
            PreparedStatement statement =
                connection.prepareStatement(
                    "insert into custom_section (sort_order, title) values (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            statement.setInt(1, order);
            statement.setString(2, title);
            return statement;
          },
          keyHolder);

      Number generatedKey = keyHolder.getKey();
      if (generatedKey == null) {
        continue;
      }

      long sectionId = generatedKey.longValue();
      List<String> lines =
          Objects.requireNonNullElseGet(section == null ? null : section.getLines(), ArrayList::new);

      for (int lineIndex = 0; lineIndex < lines.size(); lineIndex++) {
        jdbcTemplate.update(
            "insert into custom_section_line (custom_section_id, sort_order, value) values (?, ?, ?)",
            sectionId,
            lineIndex,
            safe(lines.get(lineIndex)));
      }
    }
  }

  private String safe(String value) {
    return value == null ? "" : value.trim();
  }
}
