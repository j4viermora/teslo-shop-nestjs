import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm'
import { ProductImages } from './product-images.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { nullable: false, unique: true })
    title: string

    @Column('float', { nullable: false, default: 0 })
    price: number;

    @Column('text', { nullable: true })
    description: string;

    @Column('text', { unique: true })
    slug: string;

    @Column('int', { default: 0 })
    stock: number;

    @Column('text', { array: true })
    sizes: string[];

    @Column('enum', { enum: ['male', 'female', 'children', 'unisex'], default: 'unisex' })
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    //images
    @OneToMany(
        () => ProductImages,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImages[]

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll("'", '')
    }

}

