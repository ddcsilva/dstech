import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const fontsDir = join(process.cwd(), 'src/assets/fonts');
const interRegular = readFileSync(join(fontsDir, 'Inter-Regular.ttf'));
const interBold = readFileSync(join(fontsDir, 'Inter-Bold.ttf'));

export interface OgImageOptions {
  title: string;
  subtitle?: string;
  tags?: string[];
}

export async function generateOgImage(options: OgImageOptions): Promise<Buffer> {
  const { title, subtitle, tags = [] } = options;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          fontFamily: 'Inter',
        },
        children: [
          // Top: Logo
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#ffffff',
                    },
                    children: 'DS',
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#93c5fd',
                    },
                    children: 'tech',
                  },
                },
              ],
            },
          },
          // Middle: Title + Subtitle
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 60 ? '40px' : '52px',
                      fontWeight: 700,
                      color: '#ffffff',
                      lineHeight: 1.2,
                      maxWidth: '900px',
                    },
                    children: title,
                  },
                },
                ...(subtitle
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '24px',
                            fontWeight: 400,
                            color: '#bfdbfe',
                            maxWidth: '800px',
                          },
                          children: subtitle,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
          // Bottom: Tags + Author
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              },
              children: [
                // Tags
                tags.length > 0
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap',
                        },
                        children: tags.slice(0, 4).map((tag) => ({
                          type: 'div',
                          props: {
                            style: {
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              borderRadius: '9999px',
                              padding: '6px 16px',
                              fontSize: '16px',
                              color: '#dbeafe',
                            },
                            children: tag,
                          },
                        })),
                      },
                    }
                  : { type: 'div', props: { children: '' } },
                // Author
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#ffffff',
                          },
                          children: 'Danilo Silva',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '14px',
                            color: '#93c5fd',
                          },
                          children: 'dstech.net.br',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
