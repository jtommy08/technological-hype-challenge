import { ApiProperty } from '@nestjs/swagger';

export class VideoDto {
  @ApiProperty({
    description: 'Identificador único del video (YouTube videoId).',
    example: 'vid_003',
  })
  id: string;

  @ApiProperty({
    description: 'Título del video.',
    example: 'TailwindCSS errores comunes - Tutorial',
  })
  title: string;

  @ApiProperty({
    description: 'Nombre del canal / autor.',
    example: 'JuniorDev99',
  })
  author: string;

  @ApiProperty({
    description: 'URL de la miniatura en alta resolución.',
    example:
      'https://via.placeholder.com/300x200/282c34/61dafb?text=TailwindCSS',
  })
  thumbnail: string;

  @ApiProperty({
    description:
      'Tiempo relativo de publicación en español (sin librerías de fecha).',
    example: 'Hace 2 meses',
  })
  publishedRelative: string;

  @ApiProperty({
    description:
      'Nivel de Hype calculado: (likes + comentarios) / vistas. ' +
      'Se multiplica x2 si el título contiene "tutorial" y es 0 si no hay commentCount o vistas.',
    example: 0.30797788004176496,
    type: Number,
  })
  hypeLevel: number;

  @ApiProperty({
    description:
      'True únicamente para el video con el Hype más alto de la lista (la Joya de la Corona).',
    example: true,
  })
  isCrownJewel: boolean;
}
