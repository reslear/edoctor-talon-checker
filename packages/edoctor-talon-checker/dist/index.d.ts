declare type TObject = {
    [K: string]: string;
};
interface IOptions {
    form_data: TObject;
    url: string;
}

declare const checkTalon: ({ form_data, url }: IOptions) => Promise<{
    count: number;
}>;

export { IOptions, TObject, checkTalon };
