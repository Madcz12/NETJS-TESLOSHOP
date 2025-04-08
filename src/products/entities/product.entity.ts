import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '10d5afa9-4ac4-445b-8187-2e8b93c2cb50', 
        description: 'Product ID', 
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo', 
        description: 'Product Title', 
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0, 
        description: 'Product price', 
        uniqueItems: true
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'asdfghjkl', 
        description: 'Product description', 
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo', 
        description: 'Product SLUG - for SEO purposes', 
        default: null,
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 'Teslo Shop cloth sizes', 
        description: 'Product stock', 
        default: 0,
    })
    @Column('int', {
        default: 0
    })
    stock: number;
    
    @ApiProperty({
        example: ['M', 'S', 'XL'], 
        description: 'Product stock', 
        default: null,
    })
    @Column('text', {
        
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Men and Women', 
        description: 'Product stock', 
        default: null,
    })
    @Column('text')
    gender: string;

    @Column('text', {
        array: true, 
        default: []
    })
    tags: string[];
    //images

    @OneToMany(
        () => ProductImage, 
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User, 
        ( user ) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert(){
        
        if(!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')

    }

    @BeforeUpdate()
    checkSlugUpdate(){

        if(!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ','_')
        .replaceAll("'",'')
    }

}
