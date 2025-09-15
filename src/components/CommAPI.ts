import { IProduct, TBuyerInfo} from "../types";
import { Api, ApiListResponse } from "./base/api";
import { IOrderSuccess } from "./view/OrderSuccess";

//-----СЛОЙ КОММУНИКАЦИИ-----

interface ICommAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	placeOrder(order: TBuyerInfo): Promise<IOrderSuccess>;
}

export class CommAPI extends Api implements ICommAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then(
			(data: ApiListResponse<IProduct>) => data.items
		);
	}

	getProductItem(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => item);
	}

	placeOrder(order: TBuyerInfo): Promise<IOrderSuccess> {
		return this.post('/order', order).then((res: IOrderSuccess) => res);
	}
}