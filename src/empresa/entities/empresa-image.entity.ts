import { Auth } from "src/auth/entities/user.entity";
import { Cupon } from "src/cupon/entities/cupon.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Empresa } from "./empresa.entity";


@Entity({name: 'recompensas'})
export class EmpresaImage {

    @PrimaryColumn('uuid')
    id: string
    @Column('text')
    url: string;
    @Column('text')
    nombre: string;
    @Column('text')
    descripcion: string;
    @Column('int')
    costo: number;

    @ManyToOne(()=>Empresa, empresa => empresa.image,
{onDelete: 'CASCADE'})
recompensa:Empresa;
    
}
