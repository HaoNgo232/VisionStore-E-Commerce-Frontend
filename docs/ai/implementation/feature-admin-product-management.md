---
phase: implementation
title: Admin Product Management - Implementation Guide
description: Technical implementation notes and code patterns for admin panel
feature: admin-product-management
---

# Implementation Guide - Admin Product Management

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16+ (running)
- NATS server (running)

### MinIO Setup

**1. Create Docker Compose file:**

```bash
# In backend-luan-van root
cat > docker-compose.minio.yml <<EOF
version: '3.8'

services:
  minio:
    image: quay.io/minio/minio:latest
    container_name: minio-storage
    ports:
      - "9000:9000"  # API endpoint
      - "9001:9001"  # Web console
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: minio123456
    volumes:
      - ./minio-data:/data
    command: server /data --console-address ":9001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
EOF
```

**2. Start MinIO:**

```bash
docker-compose -f docker-compose.minio.yml up -d
```

**3. Configure bucket:**

- Open http://localhost:9001
- Login: admin / minio123456
- Create bucket: `products`
- Set policy: Anonymous read (GetObject only)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::products/*"]
    }
  ]
}
```

### Environment Variables

**Backend (.env):**

```bash
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=minio123456
MINIO_BUCKET_PRODUCTS=products
MINIO_USE_SSL=false
```

**Frontend (.env.local):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

### Dependencies Installation

**Backend:**

```bash
cd backend-luan-van/apps/product-app
pnpm add nestjs-minio-client minio
pnpm add -D @types/multer
```

**Frontend:**

```bash
cd frontend-luan-van
# No extra deps needed - using existing packages
```

### ⚠️ MinIO với AWS SDK - Yếu Tố Quan Trọng

**CRITICAL: MinIO hoàn toàn tương thích với AWS S3 API nhưng cần cấu hình `forcePathStyle: true`**

MinIO được thiết kế tương thích 100% với AWS S3 API, cho phép bạn:

- ✅ Sử dụng trực tiếp AWS SDK (`@aws-sdk/client-s3`) hoặc các thư viện S3-compatible
- ✅ Migrate dễ dàng từ MinIO local → AWS S3 production chỉ bằng cách đổi endpoint
- ✅ Sử dụng cùng code cho development (MinIO) và production (AWS S3)

**Tuy nhiên, có 1 điểm khác biệt BẮT BUỘC phải cấu hình:**

#### Path-Style vs Virtual-Hosted Style URLs

AWS S3 hỗ trợ 2 kiểu URL:

- **Virtual-hosted style** (AWS default): `https://bucket-name.s3.amazonaws.com/object-key`
- **Path-style** (MinIO sử dụng): `http://localhost:9000/bucket-name/object-key`

MinIO **chỉ hỗ trợ path-style URLs**, do đó khi dùng AWS SDK phải bật cờ:

**Với `@aws-sdk/client-s3` (Node.js):**

```typescript
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1", // Bất kỳ region hợp lệ nào (không ảnh hưởng MinIO)
  credentials: {
    accessKeyId: "admin",
    secretAccessKey: "minio123456",
  },
  forcePathStyle: true, // ⚠️ BẮT BUỘC với MinIO
});
```

**Với `nestjs-minio-client` (sử dụng minio SDK native):**

```typescript
// MinioModule configuration
MinioModule.register({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "admin",
  secretKey: "minio123456",
  // Không cần forcePathStyle - minio SDK đã mặc định path-style
});
```

**Với Boto3 (Python):**

```python
import boto3

s3 = boto3.client('s3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='admin',
    aws_secret_access_key='minio123456',
    region_name='us-east-1'
    # Boto3 tự động detect MinIO và dùng path-style
)
```

**Tại sao quan trọng?**

- ❌ Nếu quên `forcePathStyle: true` → Requests sẽ fail với DNS resolution errors
- ✅ Khi migrate lên AWS S3 production → Chỉ cần remove flag này và đổi endpoint
- 🔄 Cho phép dev/test local với MinIO miễn phí, production dùng AWS S3

**Migration Path:**

```typescript
// Development (MinIO local)
const config = {
  endpoint: "http://localhost:9000",
  forcePathStyle: true, // MinIO requires path-style
  // ...
};

// Production (AWS S3)
const config = {
  // endpoint: undefined, // Use default AWS endpoint
  // forcePathStyle: false, // AWS S3 default
  region: "ap-southeast-1",
  // ...
};
```

**Use Cases Thực Tế:**

- GitHub, GitLab, MongoDB, ClickHouse đều dùng MinIO làm S3 alternative
- Laravel, NestJS apps dùng MinIO cho development, AWS S3 cho production
- Kubernetes storage với MinIO cho persistent volumes

**Tham khảo:**

- [MinIO S3 Compatibility](https://min.io/product/s3-compatibility)
- [AWS SDK Path-Style Config](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)

## Code Structure

**How is the code organized?**

### Backend Structure (product-app)

```
apps/product-app/
├── src/
│   ├── minio/
│   │   ├── minio.module.ts           # MinIO module configuration
│   │   ├── minio.service.ts          # Upload/delete logic
│   │   ├── config.ts                 # MinIO config constants
│   │   └── file.model.ts             # File interfaces
│   │
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts    # NATS @MessagePattern
│   │   ├── products.service.ts       # Business logic
│   │   └── dto/
│   │       ├── admin-create-product.dto.ts
│   │       ├── admin-update-product.dto.ts
│   │       └── admin-query-product.dto.ts
│   │
│   └── prisma/
│       └── schema.prisma             # Product model with image fields
│
└── test/
    └── products-admin.e2e-spec.ts    # E2E tests
```

### Frontend Structure

```
frontend-luan-van/
├── app/
│   └── admin/
│       ├── layout.tsx                # Admin layout with sidebar
│       ├── page.tsx                  # Dashboard (placeholder)
│       └── products/
│           ├── page.tsx              # Product list
│           ├── new/
│           │   └── page.tsx          # Create product
│           └── [id]/
│               └── edit/
│                   └── page.tsx      # Edit product
│
├── components/
│   └── layout/
│       └── AdminSidebar.tsx          # Admin navigation
│
├── features/
│   └── products/
│       ├── components/
│       │   └── admin/
│       │       ├── ProductList.tsx
│       │       ├── ProductForm.tsx
│       │       ├── ProductImageUpload.tsx
│       │       ├── ProductFilters.tsx
│       │       └── DeleteProductDialog.tsx
│       │
│       ├── services/
│       │   └── admin-products.service.ts
│       │
│       ├── hooks/
│       │   ├── use-admin-products.ts
│       │   ├── use-create-product.ts
│       │   ├── use-update-product.ts
│       │   └── use-delete-product.ts
│       │
│       └── schemas/
│           └── product-form.schema.ts
│
├── stores/
│   └── auth.store.ts                 # Extended with role check
│
└── types/
    └── product.types.ts              # Product interfaces
```

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### 1. MinIO File Upload Service (Backend)

**Location:** `apps/product-app/src/minio/minio.service.ts`

```typescript
import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { MinioService } from "nestjs-minio-client";
import { MINIO_CONFIG } from "./config";
import { BufferedFile, UploadedFileResponse } from "./file.model";
import * as crypto from "crypto";

@Injectable()
export class MinioClientService {
  private readonly logger = new Logger("MinioClientService");

  constructor(private readonly minio: MinioService) {}

  /**
   * Upload file to MinIO
   * @returns Public URL and filename
   */
  async upload(file: BufferedFile): Promise<UploadedFileResponse> {
    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException(
        "Only image files (JPEG, PNG, WebP) are allowed",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new HttpException(
        "File size exceeds 5MB limit",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate unique filename: hash + timestamp + extension
    const timestamp = Date.now().toString();
    const hash = crypto
      .createHash("md5")
      .update(timestamp + file.originalname)
      .digest("hex");
    const ext = file.originalname.substring(file.originalname.lastIndexOf("."));
    const filename = `${hash}_${timestamp}${ext}`;

    const metadata = {
      "Content-Type": file.mimetype,
      "X-Original-Name": file.originalname,
    };

    try {
      // Convert base64 back to Buffer if needed (from NATS)
      const buffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from(file.buffer, "base64");

      await this.minio.client.putObject(
        MINIO_CONFIG.bucket,
        filename,
        buffer,
        buffer.length,
        metadata,
      );

      this.logger.log(`✅ File uploaded: ${filename}`);

      const url = `http://${MINIO_CONFIG.endpoint}:${MINIO_CONFIG.port}/${MINIO_CONFIG.bucket}/${filename}`;

      return { url, filename };
    } catch (error) {
      this.logger.error(`❌ Upload failed: ${error.message}`, error.stack);
      throw new HttpException(
        "Failed to upload file to storage",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete file from MinIO
   */
  async delete(filename: string): Promise<void> {
    try {
      await this.minio.client.removeObject(MINIO_CONFIG.bucket, filename);
      this.logger.log(`🗑️ File deleted: ${filename}`);
    } catch (error) {
      // Don't throw - file might already be deleted
      this.logger.warn(`⚠️ Delete failed (file may not exist): ${filename}`);
    }
  }
}
```

**Key Points:**

- ✅ Validate MIME type and size
- ✅ Generate unique filenames (prevent collisions)
- ✅ Handle base64 buffers from NATS
- ✅ Graceful delete (don't fail if file missing)

---

#### 2. Product Service with Image Handling (Backend)

**Location:** `apps/product-app/src/products/products.service.ts`

```typescript
@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioClientService,
  ) {}

  /**
   * Admin: Create product with optional image
   */
  async adminCreate(
    dto: AdminCreateProductDto,
    file?: BufferedFile,
  ): Promise<Product> {
    let imageUrl: string | null = null;
    let imageFilename: string | null = null;

    // Upload image if provided
    if (file) {
      try {
        const uploaded = await this.minioService.upload(file);
        imageUrl = uploaded.url;
        imageFilename = uploaded.filename;
      } catch (error) {
        // Allow product creation without image
        this.logger.warn("Image upload failed, creating product without image");
      }
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        categoryId: dto.categoryId,
        imageUrl,
        imageFilename,
      },
      include: { category: true },
    });
  }

  /**
   * Admin: Update product with optional new image
   */
  async adminUpdate(
    id: string,
    dto: AdminUpdateProductDto,
    file?: BufferedFile,
  ): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new EntityNotFoundRpcException("Product", id);
    }

    let imageUrl = product.imageUrl;
    let imageFilename = product.imageFilename;

    // If new image provided, replace old one
    if (file) {
      // Delete old image if exists
      if (product.imageFilename) {
        await this.minioService.delete(product.imageFilename);
      }

      // Upload new image
      try {
        const uploaded = await this.minioService.upload(file);
        imageUrl = uploaded.url;
        imageFilename = uploaded.filename;
      } catch (error) {
        // Keep old image on upload failure
        this.logger.warn("New image upload failed, keeping old image");
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name ?? product.name,
        price: dto.price ?? product.price,
        description: dto.description ?? product.description,
        categoryId: dto.categoryId ?? product.categoryId,
        imageUrl,
        imageFilename,
      },
      include: { category: true },
    });
  }

  /**
   * Admin: Soft delete product
   * Note: Do NOT delete image - keep for audit/restore
   */
  async adminSoftDelete(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new EntityNotFoundRpcException("Product", id);
    }

    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Admin: List products with search, filter, pagination
   */
  async adminList(query: AdminQueryProductDto): Promise<ProductListResponse> {
    const { page = 1, limit = 10, search, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
```

**Key Points:**

- ✅ Graceful image upload failures (don't block product creation)
- ✅ Delete old image when uploading new one
- ✅ Soft delete does NOT delete image (keep for audit)
- ✅ Search case-insensitive với Prisma
- ✅ Pagination with metadata

---

#### 3. Gateway File Upload Forwarding

**Location:** `apps/gateway/src/products/products.controller.ts`

```typescript
@Controller('products')
export class ProductsController {
  constructor(@Inject('PRODUCT_SERVICE') private productClient: ClientProxy) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async createProduct(
    @Body() dto: AdminCreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const payload = {
      dto: {
        name: dto.name,
        price: Number(dto.price), // Convert to number
        description: dto.description,
        categoryId: dto.categoryId,
      },
      file: image ? {
        buffer: image.buffer.toString('base64'), // Serialize for NATS
        mimetype: image.mimetype,
        originalname: image.originalname,
        size: image.size,
        fieldname: image.fieldname,
        encoding: image.encoding,
      } : null,
    };

    return firstValueFrom(
      this.productClient
        .send(EVENTS.PRODUCT.ADMIN_CREATE, payload)
        .pipe(
          timeout(10000), // 10s for file upload
          retry({ count: 1, delay: 1000 }),
        ),
    );
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: AdminUpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    // Similar to create
    const payload = { id, dto: { ... }, file: { ... } };
    return firstValueFrom(...);
  }
}
```

**Key Points:**

- ✅ Validate file type/size at Gateway (early fail)
- ✅ Base64 encode buffer for NATS transmission
- ✅ Longer timeout for file uploads (10s)
- ✅ Convert string prices to numbers

---

#### 4. Frontend Admin Product Service

**Location:** `features/products/services/admin-products.service.ts`

```typescript
import { apiClient, getErrorMessage } from "@/lib/api-client";
import type {
  Product,
  ProductListResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductQueryParams,
} from "@/types";

const BASE_URL = "/products";

export const adminProductsApi = {
  /**
   * List products with filters
   */
  async list(params: ProductQueryParams): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>(BASE_URL, {
      params,
    });
    return response.data;
  },

  /**
   * Get single product by ID
   */
  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create product with multipart form data
   */
  async create(data: CreateProductRequest): Promise<Product> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price.toString());

    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.categoryId) {
      formData.append("categoryId", data.categoryId);
    }
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await apiClient.post<Product>(BASE_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Update product (partial update)
   */
  async update(id: string, data: UpdateProductRequest): Promise<Product> {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.price !== undefined)
      formData.append("price", data.price.toString());
    if (data.description) formData.append("description", data.description);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.image) formData.append("image", data.image);

    const response = await apiClient.put<Product>(
      `${BASE_URL}/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /**
   * Soft delete product
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
```

**Key Points:**

- ✅ Use FormData for file uploads
- ✅ Convert price to string for FormData
- ✅ Conditional append (only include provided fields)
- ✅ Set correct Content-Type header

---

### Patterns & Best Practices

#### 1. React Hook Pattern

```typescript
// features/products/hooks/use-create-product.ts
import { useState } from "react";
import { adminProductsApi } from "../services/admin-products.service";
import { getErrorMessage } from "@/lib/api-client";
import { toast } from "sonner";
import type { CreateProductRequest, Product } from "@/types";

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (
    data: CreateProductRequest,
  ): Promise<Product> => {
    setLoading(true);
    setError(null);

    try {
      const product = await adminProductsApi.create(data);
      toast.success("Tạo sản phẩm thành công");
      return product;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(`Lỗi: ${message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProduct, loading, error };
}
```

**Pattern:**

- Separate hook per action (create, update, delete)
- Return `{ action, loading, error }` tuple
- Show toast on success/error
- Throw error để component handle (redirect, etc.)

#### 2. Form Validation with Zod

```typescript
// features/products/schemas/product-form.schema.ts
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

import { cuidSchema } from '@/types'

export const productFormSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc").max(255),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  description: z.string().optional(),
  categoryId: cuidSchema().optional(), // Backend uses CUID, not UUID
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size tối đa 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Chỉ chấp nhận file JPG, PNG, WebP",
    )
    .optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
```

**Pattern:**

- Client-side validation matches backend rules
- Clear error messages in Vietnamese
- File validation (size + type)

#### 3. Admin Route Protection

```typescript
// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAdmin = useAuthStore((state) => state.isAdmin());

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này");
      router.push("/");
    }
  }, [isAdmin, router]);

  // Don't render anything while redirecting
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
```

**Pattern:**

- Check role in layout (protect all `/admin/*` routes)
- Show toast và redirect non-admin users
- Return null while redirecting (no flash of content)

## Integration Points

**How do pieces connect?**

### 1. API Client with Auth

All admin API calls go through `apiClient` which automatically:

- Attaches JWT token from auth store
- Refreshes token on 401
- Handles errors uniformly

```typescript
// lib/api-client.ts (existing)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. MinIO Direct Access

Images are served directly from MinIO (không qua Gateway):

```
Frontend → http://localhost:9000/products/{filename}
```

This requires:

- Public read bucket policy
- CORS enabled on MinIO (production)

### 3. NATS Message Flow

```
Gateway Controller → NATS → Product Microservice
  (REST + multipart)     (base64 buffer)     (business logic + MinIO)
```

## Error Handling

**How do we handle failures?**

### Backend Error Patterns

```typescript
// Use shared RPC exceptions
import {
  EntityNotFoundRpcException,
  ValidationRpcException,
} from "@shared/exceptions";

// Not found
if (!product) {
  throw new EntityNotFoundRpcException("Product", id);
}

// Validation
if (file.size > MAX_SIZE) {
  throw new ValidationRpcException("File size exceeds limit");
}
```

### Frontend Error Patterns

```typescript
import { getErrorMessage } from "@/lib/api-client";

try {
  await adminProductsApi.create(data);
} catch (error) {
  const message = getErrorMessage(error); // Extracts user-friendly message
  toast.error(message);
  setError(message);
}
```

### Graceful Degradation

**Scenario:** MinIO is down

**Backend:**

```typescript
try {
  const uploaded = await this.minioService.upload(file);
  imageUrl = uploaded.url;
} catch (error) {
  this.logger.warn("Image upload failed, creating product without image");
  // Continue creating product with imageUrl = null
}
```

**Frontend:**

- Product list shows placeholder image if `imageUrl` is null
- Forms allow submission without image

## Performance Considerations

**How do we keep it fast?**

### 1. Database Query Optimization

```typescript
// Index for search performance
@@index([name])
@@index([isDeleted])

// Efficient pagination
const [products, total] = await Promise.all([
  prisma.product.findMany({ ...pagination }),
  prisma.product.count({ where }),
]);
```

### 2. Frontend Optimizations

**Debounced Search:**

```typescript
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebouncedValue(searchTerm, 300);

useEffect(() => {
  fetchProducts({ search: debouncedSearch });
}, [debouncedSearch]);
```

**Image Lazy Loading:**

```typescript
<Image
  src={product.imageUrl || "/placeholder.jpg"}
  alt={product.name}
  loading="lazy"
  width={100}
  height={100}
/>
```

### 3. File Upload Optimization

**Client-side compression (future):**

```typescript
// Before upload, compress large images
import imageCompression from "browser-image-compression";

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
});
```

## Security Notes

**What security measures are in place?**

### 1. Authentication & Authorization

**Multi-layer security:**

```
1. Frontend: Route guard (UX only, not security)
2. Gateway: AuthGuard + AdminRoleGuard (real security)
3. Microservice: Trust Gateway (no additional checks)
```

### 2. File Upload Security

**Validation stack:**

```typescript
// 1. Gateway FileInterceptor options
limits: {
  fileSize: 5 * 1024 * 1024;
}
fileFilter: (file) => allowedMimeTypes.includes(file.mimetype);

// 2. MinIO Service validation
if (!allowedTypes.includes(file.mimetype)) throw BadRequest;
if (file.size > maxSize) throw BadRequest;

// 3. Filename sanitization
const filename = `${hash}_${timestamp}${ext}`; // No user input in filename
```

### 3. SQL Injection Protection

Prisma ORM provides automatic protection:

```typescript
// Safe - parameterized query
prisma.product.findMany({
  where: { name: { contains: userInput } }, // ✅ Safe
});

// Unsafe - raw SQL (avoid)
prisma.$queryRaw`SELECT * FROM products WHERE name = ${userInput}`; // ❌ Dangerous
```

### 4. MinIO Bucket Security

**Policy:**

- ✅ Public read (GetObject) - needed for image display
- ❌ No public write - uploads only via API
- ❌ No public list - prevent bucket enumeration

---

**Common Issues & Solutions:**

**Issue 1: "NATS message too large"**

- **Cause:** File > NATS max_payload (default 1MB)
- **Solution:** Increase `max_payload` in NATS config hoặc use direct HTTP upload endpoint

**Issue 2: "CORS error accessing MinIO"**

- **Cause:** Browser blocks cross-origin requests
- **Solution:** Add CORS config to MinIO (production)

**Issue 3: "Old image not deleted"**

- **Cause:** Filename extraction from URL failed
- **Solution:** Always use `imageFilename` field, not parse URL

**Issue 4: "Upload slow on production"**

- **Cause:** Large image files
- **Solution:** Client-side compression + server-side resize

---

**Next Phase:** Testing → `docs/ai/testing/feature-admin-product-management.md`
