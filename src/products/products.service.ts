import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage, Product } from './entities';


@Injectable()
export class ProductsService { // las interacciones con la base de datos son asíncronas

  // hacemos uso de los logs propios de Nest

  private readonly logger = new Logger('ProductsService');


  constructor(

    @InjectRepository(Product) // decorador para el repositorio de TypeORM
    private readonly productRepository: Repository<Product>, // Repository <T> es de TypeORM

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

     private readonly dataSource: DataSource, // para transacciones

  ){}

  async create(createProductDto: CreateProductDto) {
    
    try {
      
      const { images = [], ...productDetails } = createProductDto;
      
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image}) )
      });
      
      await this.productRepository.save(product);

      return { ...product, images };

    } catch (error) {

      this.handleDBErrorExceptions(error);
      
    }

  }
  // TODO: paginar
  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset=0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product, 
      images: product.images?.map(img => img.url)
    }))

  }

  async findOne(term: string) {

    let product: Product | null = null;
    
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id: term});
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      // buscar solo un producto ya que el termino solo busca uno a la vez 
      product = await queryBuilder
      .where(`LOWER(title) = LOWER(:term) OR LOWER(slug) = LOWER(:term)`, {
        term: term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }

    //const product = await this.productRepository.findOneBy({id});

    if(!product) throw new NotFoundException(`Product with id ${term} not found`);

    return product;
  }

  async findOnePlain(term: string){
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map( image=> image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    // ejecutamos un queryrunner con las transacciones 

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });

    if(!product) throw new NotFoundException(`Product with id: ${id} not found`);

    // create queryrunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // iniciar la transacción: 
    await queryRunner.startTransaction();
    
    try {

      if( images ) { 
        await queryRunner.manager.delete( ProductImage, {product: { id }});
        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        )
      }

      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();
    
      return this.findOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      

      this.handleDBErrorExceptions(error);
      
    }

  }

  async remove(id: string) {

    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDBErrorExceptions(error: any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error check server logs!');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      
      return await query.delete().where({}).execute();

    } catch (error) {
      this.handleDBErrorExceptions(error);
    }

  }

}
