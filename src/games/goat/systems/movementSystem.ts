import * as Commands from '../commands';
import * as Components from '../components';
import { EntityMap } from '../entity';
import { sinPiOver4 } from '../utils/mathUtils';
import { MainState } from '../game';
import { System } from './systemUtils';

export default class MovementSystem implements System {
  constructor(private state: MainState) { }

  update(entities: EntityMap) {
    for (const entityId of Object.keys(entities)) {
      const entity = entities[entityId];
      const velocity = entity.getComponent(Components.Velocity);
      const position = entity.getComponent(Components.Position);

      if (!velocity || !position) {
        continue;
      }

      const commandable = entity.getComponent(Components.Commandable);
      const commands = commandable && commandable.commands;

      if (commands) {
        let directionX = 0;
        let directionY = 0;

        const moveUp = Commands.getCommand(commands, Commands.MoveUp);
        const moveDown = Commands.getCommand(commands, Commands.MoveDown);
        const moveLeft = Commands.getCommand(commands, Commands.MoveLeft);
        const moveRight = Commands.getCommand(commands, Commands.MoveRight);
        const moveToPoint = Commands.getCommand(commands, Commands.MoveToPoint);
        const turn = Commands.getCommand(commands, Commands.Turn);

        if (moveUp || (moveToPoint && moveToPoint.y < position.y)) {
          directionY -= 1;
        }
        if (moveDown || (moveToPoint && moveToPoint.y > position.y)) {
          directionY += 1;
        }
        if (moveLeft || (moveToPoint && moveToPoint.x < position.x)) {
          directionX -= 1;
        }
        if (moveRight || (moveToPoint && moveToPoint.x > position.x)) {
          directionX += 1;
        }
        if (turn) {
          position.angle = turn.angle;
        }

        const sprite = this.state.sprites[entityId];

        if (directionX || directionY) {
          if (directionX && directionY) {
            directionX = directionX * sinPiOver4;
            directionY = directionY * sinPiOver4;
          } else {
            position.angle = Phaser.Math.angleBetweenPoints(
              new Phaser.Point(position.x, position.y),
              new Phaser.Point(position.x + directionX, position.y + directionY)
            );
          }

          if (sprite) {
            sprite.animations.play('walking');

            let spriteAngle = position.angle;
            if (spriteAngle === Math.PI || (moveToPoint && directionX < 0)) {
              spriteAngle = 0;
              sprite.scale.x = -1;
            } else {
              sprite.scale.x = 1;
            }

            sprite.rotation = spriteAngle;
          }
        } else if (sprite) {
          sprite.animations.stop();
        }

        let vX = velocity.maxSpeed * directionX;
        let vY = velocity.maxSpeed * directionY;

        if (moveToPoint) {
          const distanceY = Math.abs(position.y - moveToPoint.y);
          if (distanceY < Math.abs(vY)) {
            vY = Math.sign(vY) * distanceY;
          }

          const distanceX = Math.abs(position.x - moveToPoint.x);
          if (distanceX < Math.abs(vX)) {
            vX = Math.sign(vX) * distanceX;
          }
        }

        velocity.x = vX;
        velocity.y = vY;
      }
    }
  }
}
