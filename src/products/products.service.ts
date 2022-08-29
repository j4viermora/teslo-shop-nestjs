import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination-dto'
import { validate as isUUID } from 'uuid'
import { ProductImages, Product } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImages)
    private readonly productImageReposity: Repository<ProductImages>
  ) { }


  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // Type ORM infiere que el id del producto es el que necesita las images
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) => this.productImageReposity.create({ url: image }))
      })

      //Guarda tanto el producto como la imagenes
      await this.productRepository.save(product)

      return {
        ...product,
        images
      }
    } catch (error) {
      this.handleDBExeptions(error)
    }

  }
  //TODO paginate recommend
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })
    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map(({ url }) => url)
    }))
  }

  async findOne(term: string) {
    let product: Product

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`)
    }

    return product

  }

  async finOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term)
    return {
      ...rest,
      images: images.map(({ url }) => url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images = [], ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    })

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    // Create query runner



    try {
      await this.productRepository.save(product)
      return product
    } catch (error) {
      this.handleDBExeptions(error)
    }
  }

  async remove(id: string) {
    const { affected } = await this.productRepository.delete(id)
    if (affected === 0) throw new NotFoundException

    return {
      message: 'Product removed successfully'
    }
  }
  private handleDBExeptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)
    if (error.code === 404)
      return error

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server logs')
  }


}
