import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="container py-20 text-center">
            <div className="max-w-md mx-auto">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h2>
                <p className="text-gray-600 mb-8">
                    Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Quay về trang chủ
                    </Link>
                    <Link
                        href="/shop/products"
                        className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
                    >
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        </div>
    );
}
