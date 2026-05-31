import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'player-detail',
  styleUrl: 'player-detail.css',
  shadow: true,
})
export class PlayerDetail {
  @Prop() playerDetail: any;
  @Event() closeDetail: EventEmitter<void>;

  render() {
    if (!this.playerDetail) return <p>Selecciona un jugador...</p>;

    const { player, comments } = this.playerDetail;

    return (
      <div class="detail-container">
        <button onClick={() => this.closeDetail.emit()}>← Volver a la lista</button>

        <header>
          <img src={player.photoUrl} alt={player.name} />
          <h1>{player.name}</h1>
          <p class="subtitle">{player.firstName} {player.lastName}</p>
        </header>

        <section class="info-grid">
          <div><strong>Nacionalidad:</strong> {player.nationality}</div>
          <div><strong>Edad:</strong> {player.age} años</div>
          <div><strong>Fecha Nac.:</strong> {new Date(player.birthdate).toLocaleDateString()}</div>
          <div><strong>Altura:</strong> {player.height}m</div>
          <div><strong>Peso:</strong> {player.weight}kg</div>
          <div><strong>Dorsal:</strong> {player.number}</div>
          <div><strong>Equipo:</strong> {player.team}</div>
          <div><strong>Liga:</strong> {player.league}</div>
          <div><strong>Posición:</strong> {player.position}</div>
        </section>

        <h3>Comentarios</h3>
        {comments.map(c => (
          <div key={c.id} class="comment">
            <p><strong>{c.author}:</strong> {c.text}</p>
            <small>Rating: {c.rating}⭐ | Creado: {new Date(c.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    );
  }
}
