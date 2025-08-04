import { PrismaClient } from '@prisma/client';
import { ComponentPreviewType, PlaygroundTemplate } from '../src/types/preview';

const prisma = new PrismaClient();

// Sample preview data for popular components
const samplePreviews = [
  {
    resourceName: 'shadcn-ui',
    slug: 'shadcn-ui',
    previews: [
      {
        previewType: 'live' as const,
        exampleFramework: 'react',
        previewUrl: 'https://ui.shadcn.com/examples/cards/demo',
        exampleCode: `import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}`,
        exampleDependencies: {
          "@radix-ui/react-slot": "^1.0.2",
          "class-variance-authority": "^0.7.0",
          "clsx": "^2.0.0",
          "tailwind-merge": "^2.0.0"
        },
        isInteractive: true,
        isResponsive: true,
        supportsThemes: true,
        sandboxTemplate: 'react-ts',
        playgroundTemplate: {
          templateName: 'shadcn/ui Card Component',
          templateDescription: 'Customizable card component with header, content, and footer',
          baseCode: `// Card Component Example
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CardExample() {
  return (
    <Card className="w-[{{width}}px]">
      <CardHeader>
        <CardTitle>{{title}}</CardTitle>
        <CardDescription>{{description}}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{{content}}</p>
      </CardContent>
      <CardFooter>
        <Button variant="{{buttonVariant}}">{{buttonText}}</Button>
      </CardFooter>
    </Card>
  )
}`,
          baseProps: {
            width: 350,
            title: 'Card Title',
            description: 'Card description goes here',
            content: 'This is the main content of the card.',
            buttonText: 'Action',
            buttonVariant: 'default'
          },
          propControls: {
            width: {
              type: 'slider',
              label: 'Card Width',
              min: 200,
              max: 600,
              step: 10,
              defaultValue: 350
            },
            title: {
              type: 'text',
              label: 'Title',
              defaultValue: 'Card Title'
            },
            description: {
              type: 'text',
              label: 'Description',
              defaultValue: 'Card description goes here'
            },
            content: {
              type: 'text',
              label: 'Content',
              defaultValue: 'This is the main content of the card.'
            },
            buttonText: {
              type: 'text',
              label: 'Button Text',
              defaultValue: 'Action'
            },
            buttonVariant: {
              type: 'select',
              label: 'Button Variant',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Destructive', value: 'destructive' },
                { label: 'Outline', value: 'outline' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Ghost', value: 'ghost' },
                { label: 'Link', value: 'link' }
              ],
              defaultValue: 'default'
            }
          }
        },
        variations: [
          {
            name: 'With Form',
            description: 'Card with form inputs',
            codeSnippet: `<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Email" />
    <Input type="password" placeholder="Password" />
  </CardContent>
  <CardFooter>
    <Button className="w-full">Sign In</Button>
  </CardFooter>
</Card>`
          },
          {
            name: 'Stats Card',
            description: 'Card showing statistics',
            codeSnippet: `<Card>
  <CardHeader>
    <CardTitle className="text-2xl">$45,231.89</CardTitle>
    <CardDescription>+20.1% from last month</CardDescription>
  </CardHeader>
</Card>`
          }
        ]
      }
    ]
  },
  {
    resourceName: 'material-ui',
    slug: 'material-ui',
    previews: [
      {
        previewType: 'sandbox',
        exampleFramework: 'react',
        previewUrl: 'https://codesandbox.io/embed/material-ui-card-demo',
        exampleCode: `import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function MediaCard() {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 140 }}
        image="/static/images/cards/contemplative-reptile.jpg"
        title="green iguana"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Lizard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}`,
        exampleDependencies: {
          "@mui/material": "^5.14.0",
          "@emotion/react": "^11.11.0",
          "@emotion/styled": "^11.11.0"
        },
        isInteractive: true,
        isResponsive: true,
        supportsThemes: true,
        sandboxTemplate: 'react-ts'
      }
    ]
  },
  {
    resourceName: 'ant-design',
    slug: 'ant-design',
    previews: [
      {
        previewType: 'static',
        exampleFramework: 'react',
        screenshotUrl: '/images/previews/antd-table.png',
        exampleCode: `import React from 'react';
import { Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
      <>
        {tags.map((tag) => {
          let color = tag.length > 5 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
];

const App: React.FC = () => <Table columns={columns} dataSource={data} />;

export default App;`,
        exampleDependencies: {
          "antd": "^5.11.0",
          "@ant-design/icons": "^5.2.0"
        },
        isInteractive: false,
        isResponsive: true,
        bundleSizeKb: 85
      }
    ]
  }
];

async function seedPreviewData() {
  console.log('🌱 Seeding preview data...');

  try {
    // First, ensure we have the resources
    for (const sampleData of samplePreviews) {
      const resource = await prisma.resource.findUnique({
        where: { slug: sampleData.slug }
      });

      if (!resource) {
        console.log(`⚠️  Resource ${sampleData.resourceName} not found, skipping...`);
        continue;
      }

      console.log(`✅ Found resource: ${sampleData.resourceName}`);

      // Create previews for this resource
      for (const previewData of sampleData.previews) {
        const preview = await prisma.componentPreview.create({
          data: {
            resourceId: resource.id,
            previewType: previewData.previewType,
            previewUrl: previewData.previewUrl,
            screenshotUrl: previewData.screenshotUrl,
            exampleCode: previewData.exampleCode,
            exampleFramework: previewData.exampleFramework,
            exampleDependencies: previewData.exampleDependencies,
            isInteractive: previewData.isInteractive,
            isResponsive: previewData.isResponsive,
            supportsThemes: previewData.supportsThemes,
            sandboxTemplate: previewData.sandboxTemplate,
            bundleSizeKb: previewData.bundleSizeKb
          }
        });

        console.log(`  📸 Created preview: ${previewData.exampleFramework} - ${previewData.previewType}`);

        // Create playground template if provided
        if (previewData.playgroundTemplate) {
          const template = await prisma.playgroundTemplate.create({
            data: {
              resourceId: resource.id,
              ...previewData.playgroundTemplate
            }
          });
          console.log(`  🎮 Created playground template`);
        }

        // Create variations if provided
        if (previewData.variations) {
          for (const [index, variation] of previewData.variations.entries()) {
            await prisma.previewVariation.create({
              data: {
                previewId: preview.id,
                name: variation.name,
                description: variation.description,
                codeSnippet: variation.codeSnippet,
                sortOrder: index,
                isDefault: index === 0
              }
            });
          }
          console.log(`  🎨 Created ${previewData.variations.length} variations`);
        }
      }
    }

    console.log('✅ Preview data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding preview data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPreviewData();