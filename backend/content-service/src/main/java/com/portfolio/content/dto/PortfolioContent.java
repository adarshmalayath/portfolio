package com.portfolio.content.dto;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PortfolioContent {

  @Valid
  private Profile profile = new Profile();

  @Valid
  private List<Stat> stats = new ArrayList<>();

  @Valid
  private Experience experience = new Experience();

  @Valid
  private List<SkillGroup> skills = new ArrayList<>();

  @Valid
  private List<Project> projects = new ArrayList<>();

  @Valid
  private List<Education> education = new ArrayList<>();

  private List<String> certifications = new ArrayList<>();

  private List<String> profileDetails = new ArrayList<>();

  private Map<String, String> sectionTitles = new LinkedHashMap<>();

  @Valid
  private List<CustomSection> customSections = new ArrayList<>();

  public Profile getProfile() {
    return profile;
  }

  public void setProfile(Profile profile) {
    this.profile = profile;
  }

  public List<Stat> getStats() {
    return stats;
  }

  public void setStats(List<Stat> stats) {
    this.stats = stats;
  }

  public Experience getExperience() {
    return experience;
  }

  public void setExperience(Experience experience) {
    this.experience = experience;
  }

  public List<SkillGroup> getSkills() {
    return skills;
  }

  public void setSkills(List<SkillGroup> skills) {
    this.skills = skills;
  }

  public List<Project> getProjects() {
    return projects;
  }

  public void setProjects(List<Project> projects) {
    this.projects = projects;
  }

  public List<Education> getEducation() {
    return education;
  }

  public void setEducation(List<Education> education) {
    this.education = education;
  }

  public List<String> getCertifications() {
    return certifications;
  }

  public void setCertifications(List<String> certifications) {
    this.certifications = certifications;
  }

  public List<String> getProfileDetails() {
    return profileDetails;
  }

  public void setProfileDetails(List<String> profileDetails) {
    this.profileDetails = profileDetails;
  }

  public Map<String, String> getSectionTitles() {
    return sectionTitles;
  }

  public void setSectionTitles(Map<String, String> sectionTitles) {
    this.sectionTitles = sectionTitles;
  }

  public List<CustomSection> getCustomSections() {
    return customSections;
  }

  public void setCustomSections(List<CustomSection> customSections) {
    this.customSections = customSections;
  }

  public static class Profile {
    private String name = "";
    private String role = "";
    private String headline = "";
    private String summary = "";
    private String location = "";
    private String email = "";
    private String phone = "";
    private String linkedin = "";
    private String github = "";
    private String cvUrl = "";

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getRole() {
      return role;
    }

    public void setRole(String role) {
      this.role = role;
    }

    public String getHeadline() {
      return headline;
    }

    public void setHeadline(String headline) {
      this.headline = headline;
    }

    public String getSummary() {
      return summary;
    }

    public void setSummary(String summary) {
      this.summary = summary;
    }

    public String getLocation() {
      return location;
    }

    public void setLocation(String location) {
      this.location = location;
    }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getPhone() {
      return phone;
    }

    public void setPhone(String phone) {
      this.phone = phone;
    }

    public String getLinkedin() {
      return linkedin;
    }

    public void setLinkedin(String linkedin) {
      this.linkedin = linkedin;
    }

    public String getGithub() {
      return github;
    }

    public void setGithub(String github) {
      this.github = github;
    }

    public String getCvUrl() {
      return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
      this.cvUrl = cvUrl;
    }
  }

  public static class Stat {
    private String label = "";
    private String value = "";

    public String getLabel() {
      return label;
    }

    public void setLabel(String label) {
      this.label = label;
    }

    public String getValue() {
      return value;
    }

    public void setValue(String value) {
      this.value = value;
    }
  }

  public static class Experience {
    private String role = "";
    private String meta = "";
    private List<String> bullets = new ArrayList<>();

    public String getRole() {
      return role;
    }

    public void setRole(String role) {
      this.role = role;
    }

    public String getMeta() {
      return meta;
    }

    public void setMeta(String meta) {
      this.meta = meta;
    }

    public List<String> getBullets() {
      return bullets;
    }

    public void setBullets(List<String> bullets) {
      this.bullets = bullets;
    }
  }

  public static class SkillGroup {
    private String title = "";
    private List<String> items = new ArrayList<>();

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public List<String> getItems() {
      return items;
    }

    public void setItems(List<String> items) {
      this.items = items;
    }
  }

  public static class Project {
    private String title = "";
    private String tech = "";
    private String description = "";
    private String url = "";

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getTech() {
      return tech;
    }

    public void setTech(String tech) {
      this.tech = tech;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }
  }

  public static class Education {
    private String title = "";
    private String meta = "";
    private String detail = "";

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getMeta() {
      return meta;
    }

    public void setMeta(String meta) {
      this.meta = meta;
    }

    public String getDetail() {
      return detail;
    }

    public void setDetail(String detail) {
      this.detail = detail;
    }
  }

  public static class CustomSection {
    private String title = "";
    private List<String> lines = new ArrayList<>();

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public List<String> getLines() {
      return lines;
    }

    public void setLines(List<String> lines) {
      this.lines = lines;
    }
  }
}
