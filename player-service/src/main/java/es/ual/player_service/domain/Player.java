package es.ual.player_service.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "player")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Min(0)
    private Byte age;

    private LocalDate birthdate;

    @Column(length = 100)
    private String nationality;

    @Column(precision = 3, scale = 2)
    private BigDecimal height;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Min(0) @Max(99)
    private Byte number;

    @Column(length = 150)
    private String team;

    @Column(length = 150)
    private String league;

    @Column(length = 50)
    private String position;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @DecimalMin("-90.0") @DecimalMax("90.0")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Player() {
    }

    public Player(String name, Byte age) {
        this.name = name;
        this.age = age;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Byte getAge() { return age; }
    public void setAge(Byte age) { this.age = age; }

    public LocalDate getBirthdate() { return birthdate; }
    public void setBirthdate(LocalDate birthdate) { this.birthdate = birthdate; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public Byte getNumber() { return number; }
    public void setNumber(Byte number) { this.number = number; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public String getLeague() { return league; }
    public void setLeague(String league) { this.league = league; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
