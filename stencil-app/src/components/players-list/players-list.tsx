import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'players-list',
  styleUrl: 'players-list.css',
  shadow: true,
})
export class PlayersList {
  @Prop() players: any[] = [];
  @Event() playerSelected: EventEmitter<string>;

  render() {
    return (
      <div>
        <h2 style={{ textAlign: 'center' }}>Lista de Jugadores</h2>
        <ul>
          {this.players.map(player => (
            <li onClick={() => this.playerSelected.emit(player.id)}>
              <img src={player.photoUrl} alt={player.name} />
              <span>{player.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
